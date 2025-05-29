import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useToastContent } from '../drift/use-toast-content'

interface DecreasePositionProps {
  collateralUsdDelta: string
  desiredMint: string
  entirePosition: boolean
  positionPubkey: string
  sizeUsdDelta: string
}

interface Quote {
  closeFeeUsd: string
  feeUsd: string
  leverage: string
  liquidationPriceUsd: string
  outstandingBorrowFeeUsd: string
  pnlAfterFees: string
  pnlAfterFeesPercent: string
  pnlAfterFeesUsd: string
  pnlBeforeFees: string
  pnlBeforeFeesPercent: string
  pnlBeforeFeesUsd: string
  priceImpactFeeBps: string
  priceImpactFeeUsd: string
  positionCollateralSizeUsd: string
  positionSizeUsd: string
  side: string
  transferTokenMint: string
  transferAmountToken: string
  transferAmountUsd: string
}

interface DecreasePositionResponse {
  quote: Quote
  positionPubkey: string
  positionRequestPubkey: string
  requireKeeperSignature: boolean
  serializedTxBase64: string
  txMetadata: {
    blockhash: string
    lastValidBlockHeight: string
    transactionFeeLamports: string
    accountRentLamports: string
  }
}

export function useDecreasePosition({
  collateralUsdDelta,
  desiredMint,
  entirePosition,
  positionPubkey,
  sizeUsdDelta,
}: DecreasePositionProps) {
  const { LOADINGS, ERRORS, SUCCESS } = useToastContent()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serializedTxBase64, setSerializedTxBase64] = useState<string | null>(
    null
  )
  const [quote, setQuote] = useState<Quote | null>(null)
  const { primaryWallet } = useCurrentWallet()

  const closePosition = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)

    try {
      if (!serializedTxBase64) {
        throw new Error('No transaction available')
      }

      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(serializedTxBase64, 'base64')
      )

      const txid = await signer.signAndSendTransaction(transaction)

      const confirmToastId = toast(
        LOADINGS.CONFIRM_LOADING.title,
        LOADINGS.CONFIRM_LOADING.content
      )

      const confirmation = await connection.confirmTransaction({
        signature: txid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      toast.dismiss(confirmToastId)

      if (confirmation.value.err) {
        toast.error(
          ERRORS.DECREASE_POSITION_TX_ERR.title,
          ERRORS.DECREASE_POSITION_TX_ERR.content
        )
      } else {
        toast.success(
          SUCCESS.DECREASE_POSITION_TX_SUCCESS.title,
          SUCCESS.DECREASE_POSITION_TX_SUCCESS.content
        )
      }

      setError(null)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to decrease position'
      toast.dismiss()
      toast.error(ERRORS.DECREASE_POSITION_TX_ERR.title, {
        description: errorMessage,
        duration: 5000,
      })
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const decreasePosition = async () => {
      try {
        const response = await fetch('/api/jupiter/perps/decrease', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collateralUsdDelta,
            desiredMint,
            entirePosition,
            positionPubkey,
            sizeUsdDelta,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          console.log(error)
          throw new Error(error.error || 'Failed to decrease position')
        }

        const data: DecreasePositionResponse = await response.json()

        const serializedTxBase64 = data.serializedTxBase64
        const quote = data.quote

        setSerializedTxBase64(serializedTxBase64)
        setQuote(quote)
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : 'Failed to decrease position'
        )
      }
    }

    const intervalId = setInterval(decreasePosition, 1000)
    return () => clearInterval(intervalId)
  }, [
    collateralUsdDelta,
    desiredMint,
    entirePosition,
    positionPubkey,
    sizeUsdDelta,
  ])

  return {
    isLoading,
    error,
    quote,
    closePosition,
  }
}
