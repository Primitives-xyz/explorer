import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { useToast } from '@/hooks/use-toast'

import { Connection, VersionedTransaction } from '@solana/web3.js'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { NFT } from '@/utils/types'

// Cache for auction house addresses to prevent redundant API calls
const auctionHouseCache = new Map<string, string>()

export function useNftCancelListing(token: NFT | null) {
  const { walletAddress, primaryWallet } = useCurrentWallet()
  const t = useTranslations()
  const { toast } = useToast()
  const [showNftCancelLoading, setShowNftCancelLoading] =
    useState<boolean>(false)
  const fetchingRef = useRef(false)

  const handleNftCancelListing = async () => {
    try {
      setShowNftCancelLoading(true)

      if (!token) {
        toast({
          title: t('trade.transaction_failed'),
          description: t(
            'trade.the_cancel_transaction_failed_please_try_again'
          ),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Get token account from token
      const tokenAccount = token.tokenAccount || token.address || token.mint
      if (!tokenAccount || !token.price?.amount) {
        toast({
          title: t('trade.transaction_failed'),
          description: t(
            'trade.the_cancel_transaction_failed_please_try_again'
          ),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Get auction house address
      let auctionHouse: string | null = null
      const collectionAddress = token.metadata.collection?.family

      if (!collectionAddress) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.missing_collection_information'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Check if we already have this auction house in cache
      if (auctionHouseCache.has(collectionAddress)) {
        auctionHouse = auctionHouseCache.get(collectionAddress) || null
      } else {
        try {
          // First get collection symbol
          const getCollectionSymbolRes = await fetch(
            `/api/magiceden/collection/${collectionAddress}`
          )
          const collectionSymbolData = await getCollectionSymbolRes.json()
          const collectionSymbol = collectionSymbolData.collectionSymbol

          if (collectionSymbol) {
            // Then get auction house address
            const auctionHouseRes = await fetch(
              `/api/magiceden/collection/${collectionSymbol}/bauctionHouse`
            )
            const auctionHouseResData = await auctionHouseRes.json()
            auctionHouse = auctionHouseResData.auctionHouse

            // Cache the result
            if (auctionHouse) {
              auctionHouseCache.set(collectionAddress, auctionHouse)
            }
          }
        } catch (error) {
          console.error('Error fetching auction house info:', error)
          toast({
            title: t('trade.transaction_failed'),
            description: t('trade.error_fetching_auction_house'),
            variant: 'error',
            duration: 5000,
          })
          return
        }
      }

      if (!auctionHouse) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.auction_house_not_found'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Step 1: Fetch cancel listing transaction from backend
      const cancelRes = await fetch(
        `/api/magiceden/instructions/cancel?seller=${walletAddress}&auctionHouseAddress=${auctionHouse}&tokenMint=${token.id}&tokenAccount=${tokenAccount}&price=${token.price.amount}`
      )

      if (!cancelRes.ok) {
        const errorData = await cancelRes.json()
        console.error('Cancel listing API error:', errorData)
        toast({
          title: t('trade.transaction_failed'),
          description: t(
            'trade.the_cancel_transaction_failed_please_try_again'
          ),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      const cancelResData = await cancelRes.json()

      // Step 2: Deserialize the transaction
      const serializedBuffer = Buffer.from(cancelResData.cancelTx, 'base64')
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
      const cancelTxid = await signer.signAndSendTransaction(vtx)

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
        signature: cancelTxid.signature,
        ...latestBlockhash,
      })

      // Step 8: Dismiss the confirmation toast
      confirmToast.dismiss()

      // Step 9: Handle transaction success or failure
      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t(
            'trade.the_cancel_transaction_failed_please_try_again'
          ),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t('trade.the_cancel_transaction_was_successful'),
          variant: 'success',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Cancel listing error:', error)
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_cancel_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setShowNftCancelLoading(false)
    }
  }

  return {
    handleNftCancelListing,
    showNftCancelLoading,
  }
}
