import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useState } from 'react'
import { toast } from 'sonner'
import { useToastContent } from '../drift/use-toast-content'

export const useDeleteTPSL = () => {
  const { LOADINGS, ERRORS, SUCCESS } = useToastContent()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { primaryWallet } = useCurrentWallet()

  const deleteTPSL = async (positionRequestPubkey: string) => {
    try {
      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        throw new Error('Wallet not connected')
      }

      setIsLoading(true)

      const response = await fetch('/api/jupiter/perps/tpsl/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ positionRequestPubkey }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete TPSL')
      }

      const data = await response.json()
      const serializedTxBase64 = data.serializedTxBase64
      const signer = await primaryWallet.getSigner()
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(serializedTxBase64, 'base64')
      )
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
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
        toast.error('Cancel TP/SL failed', {
          description: 'Confirmation failed. Please try again.',
          duration: 5000,
        })
      } else {
        toast.success('Cancel TP/SL success', {
          description: 'TPSL has been cancelled.',
          duration: 5000,
        })
      }

      setError(null)
    } catch (error) {
      toast.dismiss()
      toast.error('Cancel TP/SL failed', {
        description:
          error instanceof Error ? error.message : 'Failed to delete TPSL',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    deleteTPSL,
  }
}
