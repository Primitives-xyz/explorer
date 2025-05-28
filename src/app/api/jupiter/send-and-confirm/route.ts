import {
  Connection,
  TransactionConfirmationStatus,
  VersionedTransaction,
} from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

export interface SendAndConfirmRequest {
  serializedTransaction: string
  walletAddress: string
  metadata?: {
    inputMint?: string
    outputMint?: string
    inputAmount?: string
    expectedOutput?: string
    priceImpact?: string
    slippageBps?: number
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

async function waitForSignatureConfirmation(
  connection: Connection,
  signature: string,
  timeout: number = 60000,
  interval: number = 200
): Promise<TransactionStatusUpdate> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const status = await connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      })

      if (status.value !== null) {
        if (status.value.err) {
          return {
            status: 'failed',
            signature,
            error: JSON.stringify(status.value.err),
            confirmationStatus: status.value.confirmationStatus || undefined,
            slot: status.value.slot,
          }
        }

        if (
          status.value.confirmationStatus === 'confirmed' ||
          status.value.confirmationStatus === 'finalized'
        ) {
          return {
            status: 'confirmed',
            signature,
            confirmationStatus: status.value.confirmationStatus,
            slot: status.value.slot,
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    } catch (error) {
      console.error('Error checking signature status:', error)
    }
  }

  return {
    status: 'timeout',
    signature,
    error: `Transaction not confirmed after ${timeout}ms`,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: SendAndConfirmRequest = await req.json()
    const { serializedTransaction, walletAddress, metadata } = body

    if (!serializedTransaction || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash('confirmed')

    // Send the transaction
    let signature: string
    try {
      signature = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: true,
        maxRetries: 2,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          status: 'failed' as const,
          error: error.message || 'Failed to send transaction',
        },
        { status: 500 }
      )
    }

    // Start confirmation process
    const confirmationResult = await waitForSignatureConfirmation(
      connection,
      signature,
      30000 // 30 second timeout
    )

    // If transaction was confirmed, you can add logic here to save to database
    // or create content nodes as needed
    if (confirmationResult.status === 'confirmed' && metadata) {
      // TODO: Add your createContentNode logic here
      console.log('Transaction confirmed with metadata:', metadata)
    }

    return NextResponse.json(confirmationResult)
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
