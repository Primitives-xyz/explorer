'use client'

import { TransactionStatusUpdate } from '@/app/api/jupiter/send-and-confirm/route'
import { VersionedTransaction } from '@solana/web3.js'
import { useCallback, useRef, useState } from 'react'

export interface UseJupiterTransactionOptions {
  onStatusUpdate?: (status: TransactionStatusUpdate) => void
  onSuccess?: (signature: string) => void
  onError?: (error: string) => void
}

export interface TransactionMetadata {
  inputMint?: string
  outputMint?: string
  inputAmount?: string
  expectedOutput?: string
  priceImpact?: string
  slippageBps?: number | string
  usdcFeeAmount?: string
  route?: string
  platform?: string
}

export function useJupiterTransaction(options?: UseJupiterTransactionOptions) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<TransactionStatusUpdate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendAndConfirmTransaction = useCallback(
    async (
      transaction: VersionedTransaction,
      walletAddress: string,
      metadata?: TransactionMetadata
    ): Promise<TransactionStatusUpdate> => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      setLoading(true)
      setError(null)
      setStatus({ status: 'sending' })

      try {
        // Serialize the transaction
        const serializedTransaction = Buffer.from(
          transaction.serialize()
        ).toString('base64')

        // Send to backend API
        const response = await fetch('/api/jupiter/send-and-confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serializedTransaction,
            walletAddress,
            metadata,
          }),
          signal: abortControllerRef.current.signal,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send transaction')
        }

        // Update status
        setStatus(result)

        // Call callbacks
        if (result.status === 'confirmed' && result.signature) {
          options?.onSuccess?.(result.signature)
        } else if (result.status === 'failed' || result.status === 'timeout') {
          const errorMessage = result.error || 'Transaction failed'
          setError(errorMessage)
          options?.onError?.(errorMessage)
        }

        // Always call status update
        options?.onStatusUpdate?.(result)

        return result
      } catch (err: any) {
        // Don't set error if request was aborted
        if (err.name === 'AbortError') {
          return { status: 'failed', error: 'Request cancelled' }
        }

        const errorMessage = err.message || 'Failed to send transaction'
        setError(errorMessage)
        setStatus({ status: 'failed', error: errorMessage })
        options?.onError?.(errorMessage)

        return { status: 'failed', error: errorMessage }
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setStatus(null)
    setError(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const retry = useCallback(
    async (
      transaction: VersionedTransaction,
      walletAddress: string,
      metadata?: TransactionMetadata
    ) => {
      reset()
      return sendAndConfirmTransaction(transaction, walletAddress, metadata)
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
