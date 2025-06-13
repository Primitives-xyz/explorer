import {
  Connection,
  TransactionConfirmationStatus,
  VersionedTransaction,
} from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

export interface SendAndConfirmRequest {
  serializedTransaction: string
  metadata?: Record<string, any>
}

export interface TransactionStatusUpdate {
  status: 'sending' | 'sent' | 'confirming' | 'confirmed' | 'failed' | 'timeout'
  signature?: string
  error?: string
  confirmationStatus?: TransactionConfirmationStatus
  slot?: number
}

export async function POST(req: NextRequest) {
  try {
    const body: SendAndConfirmRequest = await req.json()
    const { serializedTransaction, metadata } = body

    if (!serializedTransaction) {
      return NextResponse.json(
        {
          status: 'failed' as const,
          error: 'Missing serialized transaction',
        },
        { status: 400 }
      )
    }

    const connection = new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    )

    // Deserialize the transaction
    const transaction = VersionedTransaction.deserialize(
      Buffer.from(serializedTransaction, 'base64')
    )

    // Send the transaction
    let signature: string
    try {
      signature = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: true,
        maxRetries: 2,
      })
    } catch (error: any) {
      return NextResponse.json({
        status: 'failed' as const,
        error: error.message || 'Failed to send transaction',
      })
    }

    // Poll for confirmation using getSignatureStatus (faster than confirmTransaction)
    // Use exponential backoff: start fast, slow down over time
    const maxDuration = 30000 // 30 seconds total
    const startTime = Date.now()
    let pollInterval = 100 // Start with 100ms
    const maxPollInterval = 2000 // Max 2 seconds between polls

    while (Date.now() - startTime < maxDuration) {
      try {
        const status = await connection.getSignatureStatus(signature)

        if (status.value === null) {
          // Transaction not found yet, continue polling
          await new Promise((resolve) => setTimeout(resolve, pollInterval))
          // Exponential backoff
          pollInterval = Math.min(pollInterval * 1.5, maxPollInterval)
          continue
        }

        // Check if transaction failed
        if (status.value.err) {
          return NextResponse.json({
            status: 'failed' as const,
            signature,
            error: 'Transaction failed on chain',
          })
        }

        // Check if we've reached desired confirmation level
        if (
          status.value.confirmationStatus === 'confirmed' ||
          status.value.confirmationStatus === 'finalized'
        ) {
          return NextResponse.json({
            status: 'confirmed' as const,
            signature,
            confirmationStatus: status.value.confirmationStatus,
            slot: status.value.slot,
          })
        }

        // Still processing, continue polling
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
        // Exponential backoff
        pollInterval = Math.min(pollInterval * 1.5, maxPollInterval)
      } catch (error: any) {
        console.error('Error polling signature status:', error)
        // Continue polling on transient errors
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
        // Exponential backoff
        pollInterval = Math.min(pollInterval * 1.5, maxPollInterval)
      }
    }

    // Timeout after max retries
    return NextResponse.json({
      status: 'timeout' as const,
      signature,
      error: 'Transaction confirmation timeout after 30 seconds',
    })
  } catch (error: any) {
    console.error('Send and confirm error:', error)
    return NextResponse.json(
      {
        status: 'failed' as const,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
