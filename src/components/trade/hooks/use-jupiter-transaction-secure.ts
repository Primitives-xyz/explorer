'use client'

import { VersionedTransaction } from '@solana/web3.js'
import { useCallback, useRef, useState } from 'react'

export interface TransactionStatus {
  status:
    | 'idle'
    | 'sending'
    | 'sent'
    | 'confirming'
    | 'confirmed'
    | 'failed'
    | 'timeout'
  signature?: string
  error?: string
}

interface UseJupiterTransactionSecureParams {
  onStatusUpdate?: (status: TransactionStatus) => void
  onSuccess?: (signature: string) => void
  onError?: (error: string) => void
}

export function useJupiterTransactionSecure({
  onStatusUpdate,
  onSuccess,
  onError,
}: UseJupiterTransactionSecureParams = {}) {
  const [status, setStatus] = useState<TransactionStatus>({ status: 'idle' })
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendAndConfirmTransaction = useCallback(
    async (
      transaction: VersionedTransaction,
      walletAddress: string,
      metadata?: any
    ) => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      try {
        // Update status to sending
        const sendingStatus: TransactionStatus = { status: 'sending' }
        setStatus(sendingStatus)
        onStatusUpdate?.(sendingStatus)

        // Serialize transaction
        const serializedTransaction = Buffer.from(
          transaction.serialize()
        ).toString('base64')

        // Send request to secure endpoint
        const response = await fetch('/api/solana/send-and-confirm-swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Auth token will be added by the middleware/request
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
          throw new Error(result.error || 'Transaction failed')
        }

        // Update status based on response
        const newStatus: TransactionStatus = {
          status: result.status,
          signature: result.signature,
          error: result.error,
        }

        setStatus(newStatus)
        onStatusUpdate?.(newStatus)

        // Handle different statuses
        if (result.status === 'confirmed' && result.signature) {
          setError(null)
          onSuccess?.(result.signature)
        } else if (result.status === 'failed' || result.status === 'timeout') {
          const errorMsg = result.error || 'Transaction failed'
          setError(errorMsg)
          onError?.(errorMsg)
        }

        return result
      } catch (error: any) {
        // Handle abort
        if (error.name === 'AbortError') {
          console.log('Transaction request was cancelled')
          return
        }

        const errorMsg = error.message || 'Failed to send transaction'
        const failedStatus: TransactionStatus = {
          status: 'failed',
          error: errorMsg,
        }

        setStatus(failedStatus)
        setError(errorMsg)
        onStatusUpdate?.(failedStatus)
        onError?.(errorMsg)

        throw error
      }
    },
    [onStatusUpdate, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setStatus({ status: 'idle' })
    setError(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    sendAndConfirmTransaction,
    status: status.status,
    signature: status.signature,
    error,
    reset,
  }
}
