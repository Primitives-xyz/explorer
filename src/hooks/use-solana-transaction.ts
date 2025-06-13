'use client'

import { VersionedTransaction } from '@solana/web3.js'
import { useCallback, useState } from 'react'

export interface TransactionStatusUpdate {
  status: 'sending' | 'sent' | 'confirming' | 'confirmed' | 'failed' | 'timeout'
  signature?: string
  error?: string
  confirmationStatus?: 'processed' | 'confirmed' | 'finalized'
  slot?: number
}

export interface UseSolanaTransactionOptions {
  onStatusUpdate?: (status: TransactionStatusUpdate) => void
  onSuccess?: (signature: string) => void
  onError?: (error: string) => void
}

export function useSolanaTransaction(options?: UseSolanaTransactionOptions) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<TransactionStatusUpdate | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sendAndConfirmTransaction = useCallback(
    async (
      transaction: VersionedTransaction,
      metadata?: Record<string, any>
    ): Promise<TransactionStatusUpdate> => {
      setLoading(true)
      setError(null)

      // Update status to sending
      const sendingStatus: TransactionStatusUpdate = { status: 'sending' }
      setStatus(sendingStatus)
      options?.onStatusUpdate?.(sendingStatus)

      try {
        // Serialize the transaction
        const serializedTransaction = Buffer.from(
          transaction.serialize()
        ).toString('base64')

        // Send request to backend
        const response = await fetch('/api/solana/send-and-confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serializedTransaction,
            metadata,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send transaction')
        }

        // Update status based on result
        setStatus(result)
        options?.onStatusUpdate?.(result)

        // Handle success/failure
        if (result.status === 'confirmed' && result.signature) {
          options?.onSuccess?.(result.signature)
        } else if (result.status === 'failed' || result.status === 'timeout') {
          const errorMessage = result.error || 'Transaction failed'
          setError(errorMessage)
          options?.onError?.(errorMessage)
        }

        return result
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to send transaction'
        const errorStatus: TransactionStatusUpdate = {
          status: 'failed',
          error: errorMessage,
        }

        setError(errorMessage)
        setStatus(errorStatus)
        options?.onError?.(errorMessage)

        return errorStatus
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setStatus(null)
    setError(null)
  }, [])

  const retry = useCallback(
    async (
      transaction: VersionedTransaction,
      metadata?: Record<string, any>
    ) => {
      reset()
      return sendAndConfirmTransaction(transaction, metadata)
    },
    [reset, sendAndConfirmTransaction]
  )

  return {
    sendAndConfirmTransaction,
    loading,
    status,
    error,
    reset,
    retry,
  }
}
