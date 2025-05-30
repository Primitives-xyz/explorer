import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useState } from 'react'
import { toast } from 'sonner'
import { useToastContent } from '../drift/use-toast-content'

interface DeleteLimitOrderResponse {
  serializedTxBase64: string
  txMetadata: {
    blockhash: string
    lastValidBlockHeight: string
    transactionFeeLamports: string
    accountRentLamports: string
  }
  positionPubkey: string
  positionRequestPubkey: string
  requireKeeperSignature: boolean
}

export const useDeleteLimitOrder = () => {
  const { LOADINGS, ERRORS, SUCCESS } = useToastContent()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { primaryWallet } = useCurrentWallet()

  const deleteLimitOrder = async (positionRequestPubkey: string) => {
    try {
      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        throw new Error('Wallet not connected')
      }

      setIsLoading(true)

      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      const response = await fetch(`/api/jupiter/perps/orders/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ positionRequestPubkey }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel order')
      }

      const data: DeleteLimitOrderResponse = await response.json()
      const serializedTxBase64 = data.serializedTxBase64
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
          ERRORS.CANCEL_ORDER_TX_ERR.title,
          ERRORS.CANCEL_ORDER_TX_ERR.content
        )
      } else {
        toast.success(
          SUCCESS.CANCEL_ORDER_TX_SUCCESS.title,
          SUCCESS.CANCEL_ORDER_TX_SUCCESS.content
        )
      }

      setError(null)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to cancel order'
      toast.dismiss()
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    deleteLimitOrder,
    isLoading,
    error,
  }
}
