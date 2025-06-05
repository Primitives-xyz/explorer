import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { VersionedTransaction } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useTxExecute from './use-tx-execute'

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [base64Tx, setBase64Tx] = useState<string | null>(null)
  const [serializedTxBase64, setSerializedTxBase64] = useState<string | null>(
    null
  )
  const { loading: isTxExecuteLoading, isTxSuccess } = useTxExecute({
    serializedTxBase64: base64Tx,
    action: 'decrease-position',
  })
  const [quote, setQuote] = useState<Quote | null>(null)
  const { primaryWallet } = useCurrentWallet()

  const closePosition = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log('serializedTxBase64', serializedTxBase64)
      if (!serializedTxBase64) {
        throw new Error('No transaction available')
      }

      const signer = await primaryWallet.getSigner()

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(serializedTxBase64, 'base64')
      )

      const signedTransaction = await signer.signTransaction(transaction)
      const serializedSignedTx = signedTransaction.serialize()
      const base64Tx = Buffer.from(serializedSignedTx).toString('base64')
      setBase64Tx(base64Tx)
      setError(null)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to decrease position'
      toast.dismiss()
      toast.error('Failed to decrease position', {
        description: errorMessage,
        duration: 5000,
      })
      setError(errorMessage)
    }
  }

  useEffect(() => {
    const decreasePosition = async () => {
      try {
        setIsLoading(true)
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
      } finally {
        setIsLoading(false)
      }
    }

    const intervalId = setInterval(decreasePosition, 3000)
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
    isTxExecuteLoading,
    isTxSuccess,
    error,
    quote,
    closePosition,
  }
}
