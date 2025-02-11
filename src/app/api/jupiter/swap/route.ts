import { NextResponse } from 'next/server'
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  Keypair,
} from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { createATAIfNotExists } from '@/utils/token'
import bs58 from 'bs58'
import { JUPITER_CONFIG } from '@/config/jupiter'
import {
  fetchSwapInstructions,
  getAddressLookupTableAccounts,
  simulateTransaction,
  createSSETransferInstruction,
  buildTransactionMessage,
} from '@/services/jupiter'
import type { SwapRouteResponse } from '@/types/jupiter-service'

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

interface SwapRequest {
  quoteResponse: any
  walletAddress: string
  sseTokenAccount?: string
  sseFeeAmount?: string
  priorityFee?: number
  mintAddress: string
  isCopyTrade?: boolean
}

export async function POST(
  request: Request,
): Promise<NextResponse<SwapRouteResponse | { error: string }>> {
  try {
    const {
      quoteResponse,
      walletAddress,
      sseTokenAccount,
      sseFeeAmount,
      priorityFee,
      mintAddress,
    } = (await request.json()) as SwapRequest

    // Get and verify the ATA for the output token
    const associatedTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      new PublicKey(JUPITER_CONFIG.FEE_WALLET),
      false,
    )

    // Verify output token ATA exists, if not create it
    const outputAtaInfo = await connection.getAccountInfo(
      associatedTokenAddress,
    )
    if (!outputAtaInfo) {
      const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY
      if (!PRIVATE_KEY) {
        throw new Error('PAYER_PRIVATE_KEY is not set')
      }
      const secretKey = bs58.decode(PRIVATE_KEY)
      const payer = Keypair.fromSecretKey(secretKey)

      await createATAIfNotExists(
        connection,
        payer,
        new PublicKey(mintAddress),
        new PublicKey(JUPITER_CONFIG.FEE_WALLET),
        'High',
      )
    }

    // If using SSE fees, verify SSE fee ATA exists
    if (sseTokenAccount) {
      const sseAtaInfo = await connection.getAccountInfo(
        new PublicKey(sseTokenAccount),
      )
      if (!sseAtaInfo) {
        const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY
        if (!PRIVATE_KEY) {
          throw new Error('PAYER_PRIVATE_KEY is not set')
        }
        const secretKey = bs58.decode(PRIVATE_KEY)
        const payer = Keypair.fromSecretKey(secretKey)

        await createATAIfNotExists(
          connection,
          payer,
          new PublicKey(JUPITER_CONFIG.SSE_TOKEN_MINT),
          new PublicKey(walletAddress),
          'High',
        )
      }
    }

    // Get swap instructions from Jupiter
    const swapResponse = await fetchSwapInstructions({
      quoteResponse,
      userPublicKey: walletAddress,
      prioritizationFeeLamports: priorityFee,
      feeAccount: associatedTokenAddress.toString(),
    })

    // Get lookup table accounts
    const addressLookupTableAccounts = await getAddressLookupTableAccounts(
      connection,
      swapResponse.addressLookupTableAddresses || [],
    )

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()

    // Create SSE transfer instruction if needed
    let sseTransferInstruction = undefined
    if (sseTokenAccount && sseFeeAmount) {
      const sourceTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(JUPITER_CONFIG.SSE_TOKEN_MINT),
        new PublicKey(walletAddress),
      )

      sseTransferInstruction = await createSSETransferInstruction(
        connection,
        sourceTokenAccount,
        new PublicKey(sseTokenAccount),
        new PublicKey(walletAddress),
        sseFeeAmount,
      )
    }

    // Build and compile transaction message
    const message = buildTransactionMessage(
      new PublicKey(walletAddress),
      blockhash,
      swapResponse,
      sseTransferInstruction,
      addressLookupTableAccounts,
    )

    const transaction = new VersionedTransaction(message)

    // Simulate the transaction before returning
    await simulateTransaction(
      connection,
      transaction,
      addressLookupTableAccounts,
    )

    return NextResponse.json({
      transaction: Buffer.from(transaction.serialize()).toString('base64'),
      lastValidBlockHeight: swapResponse.lastValidBlockHeight,
      computeUnitLimit: swapResponse.computeUnitLimit,
      prioritizationFeeLamports: swapResponse.prioritizationFeeLamports,
    })
  } catch (error: any) {
    console.error('Error building swap transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to build swap transaction' },
      { status: 500 },
    )
  }
}
