import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useToastContent } from '../drift/use-toast-content'

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

interface IncreasePositionResponse {
  quote: {
    collateralLessThanFees: boolean
    entryPriceUsd: string
    leverage: string
    liquidationPriceUsd: string
    openFeeUsd: string
    outstandingBorrowFeeUsd: string
    priceImpactFeeUsd: string
    priceImpactFeeBps: string
    positionCollateralSizeUsd: string
    positionSizeUsd: string
    positionSizeTokenAmount: string
    quoteOutAmount: string | null
    quotePriceSlippagePct: string | null
    quoteSlippageBps: string | null
    side: 'long' | 'short'
    sizeUsdDelta: string
    sizeTokenDelta: string
  }
  serializedTxBase64: string
  positionPubkey: string
  positionRequestPubkey: string | null
  txMetadata: {
    blockhash: string
    lastValidBlockHeight: string
    transactionFeeLamports: string
    accountRentLamports: string
  }
  requireKeeperSignature: boolean
}

export const useIncreasePosition = ({
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
  const { LOADINGS, ERRORS, SUCCESS } = useToastContent()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serializedTx, setSerializedTx] = useState<string | null>(null)
  const [response, setResponse] = useState<IncreasePositionResponse | null>(
    null
  )
  const { primaryWallet } = useCurrentWallet()

  const placeIncreasePosition = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Wallet not connected')
    }

    if (!serializedTx || !response) {
      throw new Error('No transaction available')
    }

    try {
      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      // Deserialize the versioned transaction
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(serializedTx, 'base64')
      )

      // Sign the transaction
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
          ERRORS.INCREASE_POSITION_TX_ERR.title,
          ERRORS.INCREASE_POSITION_TX_ERR.content
        )
      } else {
        toast.success(
          SUCCESS.INCREASE_POSITION_TX_SUCCESS.title,
          SUCCESS.INCREASE_POSITION_TX_SUCCESS.content
        )
        setError(null)
      }
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
        setIsLoading(true)
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
        console.log('data', data)
        setSerializedTx(data.serializedTxBase64)
        setResponse(data)
        setError(null)
      } catch (error) {
        console.error('Failed to increase position:', error)
        setError(
          error instanceof Error ? error.message : 'An unknown error occurred'
        )
      } finally {
        setIsLoading(false)
      }
    }

    increasePosition()
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
    isLoading,
    error,
    response,
    placeIncreasePosition,
  }
}
