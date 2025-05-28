import {
  Connection,
  TransactionConfirmationStatus,
  VersionedTransaction,
} from '@solana/web3.js'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export interface SendAndConfirmRequest {
  serializedTransaction: string
  walletAddress: string
  metadata?: {
    inputMint?: string
    outputMint?: string
    inputAmount?: string
    expectedOutput?: string
    priceImpact?: string
    slippageBps?: number | string
    usdcFeeAmount?: string
    route?: string
  }
}

export interface TransactionStatusUpdate {
  status: 'sending' | 'sent' | 'confirming' | 'confirmed' | 'failed' | 'timeout'
  signature?: string
  error?: string
  confirmationStatus?: TransactionConfirmationStatus
  slot?: number
}

function createSSEMessage(data: TransactionStatusUpdate): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  // Parse the request body before creating the stream
  let body: SendAndConfirmRequest
  try {
    body = await req.json()
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { serializedTransaction, walletAddress, metadata } = body

        if (!serializedTransaction || !walletAddress) {
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                status: 'failed',
                error: 'Missing required parameters',
              })
            )
          )
          controller.close()
          return
        }

        const connection = new Connection(
          process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
          'confirmed'
        )

        // Send initial status
        controller.enqueue(
          encoder.encode(createSSEMessage({ status: 'sending' }))
        )

        // Deserialize the transaction
        const transaction = VersionedTransaction.deserialize(
          Buffer.from(serializedTransaction, 'base64')
        )

        // Send the transaction
        let signature: string
        try {
          signature = await connection.sendRawTransaction(
            transaction.serialize(),
            {
              skipPreflight: true,
              maxRetries: 2,
            }
          )

          // Send status update with signature
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                status: 'sent',
                signature,
              })
            )
          )
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                status: 'failed',
                error: error.message || 'Failed to send transaction',
              })
            )
          )
          controller.close()
          return
        }

        // Start confirmation process
        controller.enqueue(
          encoder.encode(
            createSSEMessage({
              status: 'confirming',
              signature,
            })
          )
        )

        // Wait for confirmation with periodic status updates
        const startTime = Date.now()
        const timeout = 30000 // 30 seconds
        const interval = 200 // 200ms

        while (Date.now() - startTime < timeout) {
          try {
            const status = await connection.getSignatureStatus(signature, {
              searchTransactionHistory: true,
            })

            if (status.value !== null) {
              if (status.value.err) {
                controller.enqueue(
                  encoder.encode(
                    createSSEMessage({
                      status: 'failed',
                      signature,
                      error: JSON.stringify(status.value.err),
                      confirmationStatus:
                        status.value.confirmationStatus || undefined,
                      slot: status.value.slot,
                    })
                  )
                )
                controller.close()
                return
              }

              if (
                status.value.confirmationStatus === 'confirmed' ||
                status.value.confirmationStatus === 'finalized'
              ) {
                controller.enqueue(
                  encoder.encode(
                    createSSEMessage({
                      status: 'confirmed',
                      signature,
                      confirmationStatus: status.value.confirmationStatus,
                      slot: status.value.slot,
                    })
                  )
                )

                // If transaction was confirmed and we have metadata, you can add
                // logic here to save to database or create content nodes
                if (metadata) {
                  console.log('Transaction confirmed with metadata:', metadata)
                  // TODO: Add your createContentNode logic here
                }

                controller.close()
                return
              }
            }

            await new Promise((resolve) => setTimeout(resolve, interval))
          } catch (error) {
            console.error('Error checking signature status:', error)
          }
        }

        // Timeout reached
        controller.enqueue(
          encoder.encode(
            createSSEMessage({
              status: 'timeout',
              signature,
              error: `Transaction not confirmed after ${timeout}ms`,
            })
          )
        )
        controller.close()
      } catch (error: any) {
        console.error('SSE stream error:', error)
        controller.enqueue(
          encoder.encode(
            createSSEMessage({
              status: 'failed',
              error: error.message || 'Internal server error',
            })
          )
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
