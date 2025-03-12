import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"

import { Connection, VersionedTransaction } from "@solana/web3.js"

import { NFTTokenInfo } from "@/types/Token"

interface OfferInterface {
  pdaAddress: string
  tokenMint: string
  auctionHouse: string
  buyer: string
  buyerReferral: string
  tokenSize: number
  price: number
  expiry: number
}

export function useNftSell(
  token: NFTTokenInfo | null,
  walletAddress: string,
  primaryWallet: any
) {
  const { toast } = useToast()
  const t = useTranslations()
  const [showNftSellLoading, setShowNftSellLoading] = useState<boolean>(false)
  const [bestSellOffer, setBestSellOffer] = useState<OfferInterface | null>(null)

  const handleNftSell = async () => {
    try {
      if (!token || !bestSellOffer) {
        toast({
          title: 'Not Found offer for sell',
          description: t('Not Found offer for sell. Try try again later'),
          variant: 'pending',
          duration: 5000,
        })
        return
      }

      setShowNftSellLoading(true)

      const sellTxApiRes = await fetch(
        `/api/magiceden/mmm/sol_fulfill_buy?buyer=${bestSellOffer.buyer}&seller=${walletAddress}&auctionHouseAddress=${bestSellOffer.auctionHouse}&tokenMint=${bestSellOffer.tokenMint}&tokenATA=${bestSellOffer.tokenMint}&price=${bestSellOffer.price}&newPrice=${bestSellOffer.price}&sellerExpiry=${bestSellOffer.expiry}`
      )

      const sellTxApiResData = await sellTxApiRes.json()
      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
      const serializedBuffer = Buffer.from(sellTxApiResData.sellTx, 'base64')
      const vtx: VersionedTransaction = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      const simulateTx = await connection.simulateTransaction(vtx, {
        replaceRecentBlockhash: true,
      })
      console.log('sim:', simulateTx)

      const sellTxid = await signer.signAndSendTransaction(vtx)

      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      const tx = await connection.confirmTransaction({
        signature: sellTxid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      confirmToast.dismiss()

      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_sell_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_sell_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_sell_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setShowNftSellLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    (async () => {
      try {
        const bestOfferRes = await fetch(
          `/api/magiceden/tokens/${token.id}/offers_received`
        )
        const bestOfferResData = await bestOfferRes.json()
        setBestSellOffer(bestOfferResData.bestOffer)
      } catch (error) {
        console.error('Error fetching token info:', error)
      }
    })()
  }, [token])

  return {
    handleNftSell,
    showNftSellLoading,
    bestSellOffer
  }
}