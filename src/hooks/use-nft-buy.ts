import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { useFetchAuctionHouse } from '@/hooks/use-fetch-auction-house'
import { useToast } from '@/hooks/use-toast'

import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { NFT } from '@/utils/types'

export function useNftBuy(nft: NFT | null, refreshNFTs: () => void) {
  const { walletAddress, primaryWallet } = useCurrentWallet()
  const t = useTranslations()
  const { toast } = useToast()
  const [showNftBuyLoading, setShowNftBuyLoading] = useState<boolean>(false)
  const { fetchAuctionHouse } = useFetchAuctionHouse()

  const handleNftBuy = async () => {
    try {
      setShowNftBuyLoading(true)

      if (!nft || !nft.price?.amount || !nft.owner) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_buy_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Fetch auction house if needed
      let auctionHouseAddress = null
      if (nft.metadata.collection?.family) {
        auctionHouseAddress = await fetchAuctionHouse(
          nft.metadata.collection.family
        )
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

      // Get token account from nft
      const tokenATA = nft.tokenAccount || nft.address || nft.mint

      if (!tokenATA) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.token_account_not_found'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Step 1: Fetch buy transaction from backend
      const buyRes = await fetch(
        `/api/magiceden/instructions/buy_now?buyer=${walletAddress}&seller=${nft.owner}&auctionHouseAddress=${auctionHouseAddress}&tokenMint=${nft.id}&tokenATA=${tokenATA}&price=${nft.price.amount}`
      )

      if (!buyRes.ok) {
        const errorData = await buyRes.json()
        console.error('Buy API error:', errorData)
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_buy_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      const buyResData = await buyRes.json()

      if (buyResData.error) {
        throw new Error(buyResData.error)
      }
      const txNew = new Transaction()

      // Step 2: Deserialize the transaction
      const serializedBuffer = Buffer.from(buyResData.buyTx, 'base64')

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
      const buyTxid = await signer.signAndSendTransaction(vtx)

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
        signature: buyTxid.signature,
        ...latestBlockhash,
      })

      // Step 8: Dismiss the confirmation toast
      confirmToast.dismiss()

      // Step 9: Handle transaction success or failure
      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_buy_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t('trade.you_have_successfully_purchased_the_nft'),
          variant: 'success',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Buy NFT error:', error)
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_buy_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setShowNftBuyLoading(false)
      // wait like 750 ms
      await new Promise((resolve) => setTimeout(resolve, 750))
      refreshNFTs()
    }
  }

  return {
    handleNftBuy,
    showNftBuyLoading,
  }
}
