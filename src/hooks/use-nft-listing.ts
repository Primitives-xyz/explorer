import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { useFetchAuctionHouse } from '@/hooks/use-fetch-auction-house'
import { useToast } from '@/hooks/use-toast'

import { Connection, VersionedTransaction } from '@solana/web3.js'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'

// Cache for collection symbols to prevent redundant API calls
const collectionSymbolCache = new Map<string, string>()

export function useNftListing({
  tokenId,
  collectionFamily,
  refreshNFTs,
}: {
  tokenId: string
  collectionFamily: string
  refreshNFTs: () => void
}) {
  const { walletAddress, primaryWallet } = useCurrentWallet()
  const t = useTranslations()
  const { toast } = useToast()
  const [listAmount, setListAmount] = useState<string>('')
  const [showNftListLoading, setShowNftListLoading] = useState<boolean>(false)
  const { fetchAuctionHouse } = useFetchAuctionHouse()

  const validateAmount = (value: string): boolean => {
    // Empty check
    if (value === '') return false

    // Convert to number and check if it's valid
    const numericValue = Number(value)

    // Check if NaN or not positive
    if (isNaN(numericValue) || numericValue <= 0) {
      return false
    }

    return true
  }

  // Fetch collection symbol only when needed
  const fetchCollectionSymbol = async (
    collectionAddress: string
  ): Promise<string | null> => {
    try {
      // Check if we already have this collection symbol in cache
      if (collectionSymbolCache.has(collectionAddress)) {
        return collectionSymbolCache.get(collectionAddress) || null
      }

      const getCollectionSymbolRes = await fetch(
        `/api/magiceden/collection/${collectionAddress}`
      )
      const collectionSymbolData = await getCollectionSymbolRes.json()
      const collectionSymbol = collectionSymbolData.collectionSymbol

      // Cache the result
      if (collectionSymbol) {
        collectionSymbolCache.set(collectionAddress, collectionSymbol)
      }

      return collectionSymbol || null
    } catch (error) {
      console.error('Error fetching collection symbol:', error)
      return null
    }
  }

  const handleNftList = async () => {
    try {
      setShowNftListLoading(true)

      if (!validateAmount(listAmount)) {
        toast({
          title: 'List Amount Error',
          description: 'Invalid List Amount. Please try to input again',
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Fetch collection symbol
      const collectionSymbol = await fetchCollectionSymbol(collectionFamily)
      if (!collectionSymbol) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.collection_symbol_not_found'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Fetch auction house
      const auctionHouse = await fetchAuctionHouse(collectionFamily)
      // Step 1: Fetch listing transaction from backend
      const listRes = await fetch(
        `/api/magiceden/instructions/list?seller=${walletAddress}&auctionHouseAddress=${auctionHouse}&tokenMint=${tokenId}&tokenAccount=${tokenId}&price=${Number(
          listAmount
        )}`
      )
      const listResData = await listRes.json()

      // Step 2: Deserialize the transaction
      const serializedBuffer = Buffer.from(listResData.listTx, 'base64')
      const vtx: VersionedTransaction = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      // Step 3: Get wallet signer & RPC connection
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      // Step 4: Simulate the transaction (optional debugging step)
      const simulateTx = await connection.simulateTransaction(vtx, {
        replaceRecentBlockhash: true,
      })
      console.log('Simulation result:', simulateTx)

      // Step 5: Sign & send the transaction
      const signer = await primaryWallet.getSigner()
      const listTxid = await signer.signAndSendTransaction(vtx)

      // Step 6: Show "confirming transaction" toast
      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      // Step 7: Confirm the transaction
      const latestBlockhash = await connection.getLatestBlockhash()
      const tx = await connection.confirmTransaction(
        {
          signature: listTxid.signature,
          ...latestBlockhash,
        },
        'confirmed'
      )

      // Step 8: Dismiss the confirmation toast
      confirmToast.dismiss()
      // Step 9: Handle transaction success or failure
      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_list_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_list_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })
        // wait like 250 ms
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log('Refreshing NFTs')
        refreshNFTs()
      }
    } catch (error) {
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_list_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setShowNftListLoading(false)
      setListAmount('')
    }
  }

  return {
    handleNftList,
    listAmount,
    setListAmount,
    showNftListLoading,
  }
}
