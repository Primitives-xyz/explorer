import { IncreasePositionResponse } from '@/components/tapestry/models/jupiter.models'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { VersionedTransaction } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useToastContent } from '../drift/use-toast-content'
import useTxExecute from './use-tx-execute'

interface IncreasePositionParams {
  collateralMint: string
  collateralTokenDelta: string
  includeSerializedTx: boolean
  inputMint: string
  leverage: string
  marketMint: string
  maxSlippageBps: string
  triggerPrice?: string
  side: 'long' | 'short'
  walletAddress: string
}

export const useIncrease = ({
  collateralMint,
  collateralTokenDelta,
  includeSerializedTx,
  inputMint,
  leverage,
  marketMint,
  maxSlippageBps,
  side,
  walletAddress,
}: IncreasePositionParams) => {
  const { ERRORS } = useToastContent()
  const [isIncreaseLoading, setIsIncreaseLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serializedTx, setSerializedTx] = useState<string | null>(null)
  const [response, setResponse] = useState<IncreasePositionResponse | null>(
    null
  )
  const { primaryWallet } = useCurrentWallet()
  const [base64Tx, setBase64Tx] = useState<string | null>(null)
  const { loading: isTxExecuteLoading } = useTxExecute({
    serializedTxBase64: base64Tx,
    action: 'increase-position',
  })

  const placeIncreasePosition = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Wallet not connected')
    }

    if (!serializedTx || !response) {
      throw new Error('No transaction available')
    }

    try {
      const signer = await primaryWallet.getSigner()

      // Deserialize the versioned transaction
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(serializedTx, 'base64')
      )

      // Sign the transaction
      const signedTransaction = await signer.signTransaction(transaction)
      const serializedSignedTx = signedTransaction.serialize()
      const base64Tx = Buffer.from(serializedSignedTx).toString('base64')
      setBase64Tx(base64Tx)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to place increase position'
      toast.error(ERRORS.INCREASE_POSITION_TX_ERR.title, {
        description: errorMessage,
        duration: 5000,
      })
      setError(errorMessage)
    }
  }

  useEffect(() => {
    const increasePosition = async () => {
      try {
        if (Number(collateralTokenDelta) === 0) return

        setIsIncreaseLoading(true)

        const response = await fetch('/api/jupiter/perps/increase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collateralMint,
            collateralTokenDelta,
            includeSerializedTx,
            inputMint,
            leverage,
            marketMint,
            maxSlippageBps,
            side,
            walletAddress,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to increase position')
        }

        const data: IncreasePositionResponse = await response.json()
        setSerializedTx(data.serializedTxBase64)
        setResponse(data)
        setError(null)
      } catch (error) {
        if (Number(collateralTokenDelta) > 0 && walletAddress.length !== 0) {
          setError(
            error instanceof Error ? error.message : 'An unknown error occurred'
          )
        } else {
          setError(null)
        }
      } finally {
        setIsIncreaseLoading(false)
      }
    }

    // Set up interval to run every 5 seconds
    const intervalId = setInterval(increasePosition, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [
    collateralMint,
    collateralTokenDelta,
    includeSerializedTx,
    inputMint,
    leverage,
    marketMint,
    maxSlippageBps,
    side,
    walletAddress,
  ])

  return {
    isIncreaseLoading,
    isTxExecuteLoading,
    error,
    response,
    placeIncreasePosition,
  }
}
