import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { useToast } from '@/hooks/use-toast'

import { Connection, VersionedTransaction } from '@solana/web3.js'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { NFT } from '@/utils/types'

// Cache for collection symbols and auction houses to prevent redundant API calls
const collectionSymbolCache = new Map<string, string>()
const auctionHouseCache = new Map<string, string>()

export function useNftListing(token: NFT | null) {
  const { walletAddress, primaryWallet } = useCurrentWallet()
  const t = useTranslations()
  const { toast } = useToast()
  const [listAmount, setListAmount] = useState<string>('')
  const [showNftListLoading, setShowNftListLoading] = useState<boolean>(false)

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

  // Fetch auction house address only when needed
  const fetchAuctionHouse = async (
    collectionSymbol: string
  ): Promise<string | null> => {
    try {
      // Check if we already have this auction house in cache
      if (auctionHouseCache.has(collectionSymbol)) {
        return auctionHouseCache.get(collectionSymbol) || null
      }

      const auctionHouseRes = await fetch(
        `/api/magiceden/collection/${collectionSymbol}/zauctionHouse`
      )
      const auctionHouseResData = await auctionHouseRes.json()
      const auctionHouseAddress = auctionHouseResData.auctionHouse

      // Cache the result
      if (auctionHouseAddress) {
        auctionHouseCache.set(collectionSymbol, auctionHouseAddress)
      }

      return auctionHouseAddress || null
    } catch (error) {
      console.error('Error fetching auction house info:', error)
      return null
    }
  }

  const handleNftList = async () => {
    try {
      setShowNftListLoading(true)

      if (!token) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_list_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      if (!validateAmount(listAmount)) {
        toast({
          title: 'List Amount Error',
          description: 'Invalid List Amount. Please try to input again',
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Get collection address
      const collectionAddress = token.metadata?.collection?.family
      if (!collectionAddress) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.missing_collection_information'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Fetch collection symbol
      const collectionSymbol = await fetchCollectionSymbol(collectionAddress)
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
      const auctionHouse = await fetchAuctionHouse(collectionSymbol)
      if (!auctionHouse) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.auction_house_not_found'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Step 1: Fetch listing transaction from backend
      const listRes = await fetch(
        `/api/magiceden/instructions/list?seller=${walletAddress}&auctionHouseAddress=${auctionHouse}&tokenMint=${
          token.id
        }&tokenAccount=${token.id}&price=${Number(listAmount)}`
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
