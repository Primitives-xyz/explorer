'use client'

import { TransactionStatusUpdate } from '@/app/api/jupiter/send-and-confirm-sse/route'
import { VersionedTransaction } from '@solana/web3.js'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseJupiterTransactionSSEOptions {
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
}

export function useJupiterTransactionSSE(
  options?: UseJupiterTransactionSSEOptions
) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<TransactionStatusUpdate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  const sendAndConfirmTransaction = useCallback(
    async (
      transaction: VersionedTransaction,
      walletAddress: string,
      metadata?: TransactionMetadata
    ): Promise<TransactionStatusUpdate> => {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      setLoading(true)
      setError(null)
      setStatus({ status: 'sending' })

      return new Promise((resolve, reject) => {
        try {
          // Serialize the transaction
          const serializedTransaction = Buffer.from(
            transaction.serialize()
          ).toString('base64')

          // Create EventSource for SSE
          const url = new URL(
            '/api/jupiter/send-and-confirm-sse',
            window.location.origin
          )

          // We need to send the data via POST, so we'll use fetch with ReadableStream
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              serializedTransaction,
              walletAddress,
              metadata,
            }),
            signal: abortControllerRef.current?.signal,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error('Failed to connect to SSE endpoint')
              }

              const reader = response.body?.getReader()
              if (!reader) {
                throw new Error('No response body')
              }

              const decoder = new TextDecoder()
              let buffer = ''

              const processStream = async () => {
                try {
                  while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''

                    for (const line of lines) {
                      if (line.startsWith('data: ')) {
                        try {
                          const data = JSON.parse(line.slice(6))
                          const statusUpdate = data as TransactionStatusUpdate

                          // Update state
                          setStatus(statusUpdate)
                          options?.onStatusUpdate?.(statusUpdate)

                          // Handle completion states
                          if (
                            statusUpdate.status === 'confirmed' &&
                            statusUpdate.signature
                          ) {
                            options?.onSuccess?.(statusUpdate.signature)
                            setLoading(false)
                            resolve(statusUpdate)
                          } else if (
                            statusUpdate.status === 'failed' ||
                            statusUpdate.status === 'timeout'
                          ) {
                            const errorMessage =
                              statusUpdate.error || 'Transaction failed'
                            setError(errorMessage)
                            options?.onError?.(errorMessage)
                            setLoading(false)
                            resolve(statusUpdate)
                          }
                        } catch (e) {
                          console.error('Failed to parse SSE data:', e)
                        }
                      }
                    }
                  }
                } catch (error: any) {
                  if (error.name !== 'AbortError') {
                    console.error('Stream processing error:', error)
                    const errorMessage =
                      error.message || 'Stream processing failed'
                    setError(errorMessage)
                    setStatus({ status: 'failed', error: errorMessage })
                    setLoading(false)
                    reject(error)
                  }
                }
              }

              processStream()
            })
            .catch((error) => {
              if (error.name !== 'AbortError') {
                const errorMessage =
                  error.message || 'Failed to send transaction'
                setError(errorMessage)
                setStatus({ status: 'failed', error: errorMessage })
                options?.onError?.(errorMessage)
                setLoading(false)
                reject(error)
              }
            })
        } catch (err: any) {
          const errorMessage = err.message || 'Failed to send transaction'
          setError(errorMessage)
          setStatus({ status: 'failed', error: errorMessage })
          options?.onError?.(errorMessage)
          setLoading(false)
          reject(err)
        }
      })
    },
    [options]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setStatus(null)
    setError(null)
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
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
