import { useState } from 'react'
import { VersionedTransaction } from '@solana/web3.js'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import type { PriorityLevel } from '@/types/jupiter'
import { confirmTransactionFast } from '@/utils/transaction'

export function useCommentFee() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { primaryWallet } = useCurrentWallet()

  const processCommentFee = async (
    targetWalletAddress: string,
    priorityLevel: PriorityLevel = 'Medium',
  ) => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Wallet not connected')
    }

    setIsProcessing(true)
    setError(null)

    try {
      const walletAddress = primaryWallet.address

      // Get the fee transaction from our API
      const response = await fetch('/api/comments/fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          targetWalletAddress,
          priorityLevel,
        }),
      }).then((res) => res.json())

      if (response.error) {
        throw new Error(response.error)
      }

      // Deserialize and sign the transaction
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(response.transaction, 'base64'),
      )

      const signer = await primaryWallet.getSigner()
      const txid = await signer.signAndSendTransaction(transaction)

      // Wait for confirmation using our custom fast confirmation
      const connection = await primaryWallet.getConnection()
      await confirmTransactionFast(connection, txid.signature, 'confirmed')

      return txid.signature
    } catch (err: any) {
      console.error('Failed to process comment fee:', err)
      setError(err.message || 'Failed to process comment fee')
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processCommentFee,
    isProcessing,
    error,
  }
}
