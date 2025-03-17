import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { useToast } from '@/hooks/use-toast'

import { Connection, VersionedTransaction } from '@solana/web3.js'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { NFT } from '@/utils/types'

// Cache for auction house addresses to prevent redundant API calls
const auctionHouseCache = new Map<string, string>()

export function useNftChangePrice(token: NFT | null, refreshNFTs: () => void) {
  const { walletAddress, primaryWallet } = useCurrentWallet()
  const t = useTranslations()
  const { toast } = useToast()
  const [showNftChangePriceLoading, setShowNftChangePriceLoading] =
    useState<boolean>(false)
  const [newPrice, setNewPrice] = useState<string>('')
  const [auctionHouse, setAuctionHouse] = useState<string | null>(null)
  const [isChangePriceModalOpen, setIsChangePriceModalOpen] =
    useState<boolean>(false)

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

  // Fetch auction house address only when needed
  const fetchAuctionHouse = async (
    collectionAddress: string
  ): Promise<string | null> => {
    try {
      // Check if we already have this auction house in cache
      if (auctionHouseCache.has(collectionAddress)) {
        return auctionHouseCache.get(collectionAddress) || null
      }

      // First get collection symbol
      const getCollectionSymbolRes = await fetch(
        `/api/magiceden/collection/${collectionAddress}`
      )
      const collectionSymbolData = await getCollectionSymbolRes.json()
      const collectionSymbol = collectionSymbolData.collectionSymbol

      if (collectionSymbol) {
        // Then get auction house address
        const auctionHouseRes = await fetch(
          `/api/magiceden/collection/${collectionSymbol}/auctionHouse`
        )
        const auctionHouseResData = await auctionHouseRes.json()
        const auctionHouseAddress = auctionHouseResData.auctionHouse

        // Cache the result
        if (auctionHouseAddress) {
          auctionHouseCache.set(collectionAddress, auctionHouseAddress)
        }

        return auctionHouseAddress
      }
      return null
    } catch (error) {
      console.error('Error fetching auction house info:', error)
      return null
    }
  }

  const handleNftChangePrice = async () => {
    try {
      setShowNftChangePriceLoading(true)

      if (!token || !token.price?.amount || !validateAmount(newPrice)) {
        toast({
          title: t('trade.transaction_failed'),
          description: t(
            'trade.the_change_price_transaction_failed_please_try_again'
          ),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Fetch auction house if not already available
      let auctionHouseAddress = auctionHouse
      if (!auctionHouseAddress && token.metadata.collection?.family) {
        auctionHouseAddress = await fetchAuctionHouse(
          token.metadata.collection.family
        )
        setAuctionHouse(auctionHouseAddress)
      }

      if (!auctionHouseAddress) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.auction_house_not_found'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Get token account from token using the same approach as in cancel listing
      const tokenAccount = token.tokenAccount || token.address || token.mint
      if (!tokenAccount) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.token_account_not_found'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Step 1: Fetch change price transaction from backend
      const changePriceRes = await fetch(
        `/api/magiceden/instructions/change-price?seller=${walletAddress}&auctionHouseAddress=${auctionHouseAddress}&tokenMint=${
          token.id
        }&tokenAccount=${tokenAccount}&price=${
          token.price.amount
        }&newPrice=${Number(newPrice)}`
      )

      if (!changePriceRes.ok) {
        const errorData = await changePriceRes.json()
        console.error('Change price API error:', errorData)
        toast({
          title: t('trade.transaction_failed'),
          description: t(
            'trade.the_change_price_transaction_failed_please_try_again'
          ),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      const changePriceResData = await changePriceRes.json()

      if (changePriceResData.error) {
        throw new Error(changePriceResData.error)
      }

      // Step 2: Deserialize the transaction
      const serializedBuffer = Buffer.from(
        changePriceResData.changePriceTx,
        'base64'
      )
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
      const changePriceTxid = await signer.signAndSendTransaction(vtx)

      // Step 6: Show "confirming transaction" toast
      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      // Step 7: Confirm the transaction
      const latestBlockhash = await connection.getLatestBlockhash()
      const tx = await connection.confirmTransaction({
        signature: changePriceTxid.signature,
        ...latestBlockhash,
      })

      // Step 8: Dismiss the confirmation toast
      confirmToast.dismiss()

      // Step 9: Handle transaction success or failure
      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t(
            'trade.the_change_price_transaction_failed_please_try_again'
          ),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t('trade.the_price_was_successfully_updated'),
          variant: 'success',
          duration: 5000,
        })
        setIsChangePriceModalOpen(false)
        refreshNFTs()
      }
    } catch (error) {
      console.error('Change price error:', error)
      toast({
        title: t('trade.transaction_failed'),
        description: t(
          'trade.the_change_price_transaction_failed_please_try_again'
        ),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setShowNftChangePriceLoading(false)
      setNewPrice('')
    }
  }

  // Reset state when modal is closed
  useEffect(() => {
    if (!isChangePriceModalOpen) {
      setNewPrice('')
    }
  }, [isChangePriceModalOpen])

  return {
    handleNftChangePrice,
    showNftChangePriceLoading,
    newPrice,
    setNewPrice,
    isChangePriceModalOpen,
    setIsChangePriceModalOpen,
  }
}
