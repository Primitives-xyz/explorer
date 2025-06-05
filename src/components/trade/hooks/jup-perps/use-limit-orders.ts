import { LimitOrderResponse } from '@/components/tapestry/models/jupiter.models'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { VersionedTransaction } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useToastContent } from '../drift/use-toast-content'
import useTxExecute from './use-tx-execute'

interface LimitOrderParams {
  collateralMint: string
  collateralTokenDelta: string
  includeSerializedTx: boolean
  inputMint: string
  leverage: string
  marketMint: string
  side: string
  triggerPrice: string
  walletAddress: string
}

export const useLimitOrders = ({
  collateralMint,
  collateralTokenDelta,
  includeSerializedTx,
  inputMint,
  leverage,
  marketMint,
  side,
  triggerPrice,
  walletAddress,
}: LimitOrderParams) => {
  const { ERRORS } = useToastContent()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serializedTx, setSerializedTx] = useState<string | null>(null)
  const { primaryWallet } = useCurrentWallet()
  const [response, setResponse] = useState<LimitOrderResponse | null>(null)
  const [base64Tx, setBase64Tx] = useState<string | null>(null)
  const { loading: isTxExecuteLoading } = useTxExecute({
    serializedTxBase64: base64Tx,
    action: 'limit-order',
  })

  const placeLimitOrder = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Wallet not connected')
    }

    if (!serializedTx || !response) {
      throw new Error('No transaction available')
    }

    try {
      const signer = await primaryWallet.getSigner()

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(serializedTx, 'base64')
      )

      const signedTransaction = await signer.signTransaction(transaction)
      const serializedSignedTx = signedTransaction.serialize()
      const base64Tx = Buffer.from(serializedSignedTx).toString('base64')
      setBase64Tx(base64Tx)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to place limit order'
      toast.error('Failed to place limit order', {
        description: errorMessage,
        duration: 5000,
      })
      setError(errorMessage)
    }
  }

  useEffect(() => {
    const placeLimitOrder = async () => {
      const counter = Math.floor(Math.random() * 1e6).toString()

      if (Number(triggerPrice) === 0) {
        setError('Trigger price must be greater than 0')
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch('/api/jupiter/perps/limit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collateralMint,
            collateralTokenDelta,
            counter,
            includeSerializedTx,
            inputMint,
            leverage,
            marketMint,
            side,
            triggerPrice,
            walletAddress,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to place limit order')
        }

        const data: LimitOrderResponse = await response.json()
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
        setIsLoading(false)
      }
    }

    // Set up interval to run every 5 seconds
    const intervalId = setInterval(placeLimitOrder, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [
    collateralMint,
    collateralTokenDelta,
    includeSerializedTx,
    inputMint,
    leverage,
    marketMint,
    side,
    triggerPrice,
    walletAddress,
  ])

  return {
    isLoading,
    isTxExecuteLoading,
    error,
    response,
    placeLimitOrder,
  }
}
