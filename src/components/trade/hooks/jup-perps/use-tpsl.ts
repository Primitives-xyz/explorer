import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useToastContent } from '../drift/use-toast-content'

interface UseTPSLProps {
  owner: string
  positionPubkey: string
  tpsl: {
    requestType: string
    desiredMint: string
    triggerPrice: string
    sizeUsdDelta: string
    entirePosition: boolean
  }[]
}

interface TPSLResponse {
  tpslPubkeys: string[]
  serializedTxBase64: string
  txMetadata: {
    blockhash: string
    lastValidBlockHeight: string
    transactionFeeLamports: string
    accountRentLamports: string
  }
  requireKeeperSignature: boolean
  transactionType: 'instant'
}

export function useTPSL({ owner, positionPubkey, tpsl }: UseTPSLProps) {
  const { LOADINGS, ERRORS, SUCCESS } = useToastContent()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { primaryWallet } = useCurrentWallet()

  const placeTPSL = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/jupiter/perps/tpsl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner, positionPubkey, tpsl }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.log(error)
        throw new Error(error.error || 'Failed to create TPSL')
      }

      const data: TPSLResponse = await response.json()
      const serializedTxBase64 = data.serializedTxBase64

      if (!serializedTxBase64) {
        throw new Error('No transaction available')
      }

      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      // Deserialize the versioned transaction
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
          ERRORS.INCREASE_POSITION_TX_ERR.title,
          ERRORS.INCREASE_POSITION_TX_ERR.content
        )
      } else {
        toast.success(
          SUCCESS.INCREASE_POSITION_TX_SUCCESS.title,
          SUCCESS.INCREASE_POSITION_TX_SUCCESS.content
        )
      }

      setError(null)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to place increase position'
      toast.error(ERRORS.INCREASE_POSITION_TX_ERR.title, {
        description: errorMessage,
        duration: 5000,
      })
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [owner, positionPubkey, tpsl])

  return {
    isLoading,
    error,
    placeTPSL,
  }
}
