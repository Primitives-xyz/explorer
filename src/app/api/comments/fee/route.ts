import { NextResponse } from 'next/server'
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  ComputeBudgetProgram,
  Transaction,
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import type { PriorityLevel } from '@/types/jupiter'

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
const HELIUS_API_KEY = process.env.HELIUS_API_KEY
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
const SSE_TOKEN_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'
const FEE_WALLET = '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'
const COMMENT_FEE_AMOUNT = 100_000_000 // 100 SSE (assuming 6 decimals)
const DEFAULT_COMPUTE_UNIT_LIMIT = 200_000

interface CommentFeeRequest {
  walletAddress: string // Commenter's wallet
  targetWalletAddress: string // Profile owner's wallet
  priorityLevel?: PriorityLevel // Optional priority level
}

async function getPriorityFeeEstimate(
  transaction: Transaction,
  priorityLevel: PriorityLevel = 'Medium',
) {
  if (!HELIUS_API_KEY) {
    throw new Error('HELIUS_API_KEY is not configured')
  }

  // Extract account keys from the transaction
  const accountKeys = transaction.instructions
    .flatMap((ix) => [
      ix.programId.toString(),
      ...ix.keys.map((key) => key.pubkey.toString()),
    ])
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates

  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'helius-priority-fee',
      method: 'getPriorityFeeEstimate',
      params: [
        {
          accountKeys,
          options: {
            priorityLevel,
            includeAllPriorityFeeLevels: true,
          },
        },
      ],
    }),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  // Ensure we have a valid priority fee value
  const priorityFee = data.result?.priorityFeeLevels?.[priorityLevel]
  if (typeof priorityFee !== 'number' || isNaN(priorityFee)) {
    // Default to a reasonable priority fee if the API doesn't return a valid value
    return BigInt(1000)
  }

  return BigInt(Math.ceil(priorityFee))
}

export async function POST(request: Request) {
  try {
    const {
      walletAddress,
      targetWalletAddress,
      priorityLevel = 'Medium',
    } = (await request.json()) as CommentFeeRequest

    // Calculate fee split
    const ownerAmount = Math.floor(COMMENT_FEE_AMOUNT * 0.8) // 80% to profile owner
    const feeAmount = COMMENT_FEE_AMOUNT - ownerAmount // Remainder to fee wallet (20%)

    // Get all necessary token accounts
    const [sourceTokenAccount, ownerTokenAccount, feeTokenAccount] =
      await Promise.all([
        getAssociatedTokenAddress(
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(walletAddress),
        ),
        getAssociatedTokenAddress(
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(targetWalletAddress),
        ),
        getAssociatedTokenAddress(
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(FEE_WALLET),
        ),
      ])

    // Check if accounts exist
    const [sourceInfo, ownerInfo, feeInfo] = await Promise.all([
      connection.getAccountInfo(sourceTokenAccount),
      connection.getAccountInfo(ownerTokenAccount),
      connection.getAccountInfo(feeTokenAccount),
    ])

    if (!sourceInfo || !ownerInfo || !feeInfo) {
      throw new Error(
        'One or more SSE token accounts not found. Please ensure all accounts exist.',
      )
    }

    // Create transfer instructions
    const ownerTransferInstruction = createTransferInstruction(
      sourceTokenAccount,
      ownerTokenAccount,
      new PublicKey(walletAddress),
      BigInt(ownerAmount),
      [],
      TOKEN_PROGRAM_ID,
    )

    const feeTransferInstruction = createTransferInstruction(
      sourceTokenAccount,
      feeTokenAccount,
      new PublicKey(walletAddress),
      BigInt(feeAmount),
      [],
      TOKEN_PROGRAM_ID,
    )

    // Create a legacy transaction to estimate priority fees
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash()
    const legacyTransaction = new Transaction({
      feePayer: new PublicKey(walletAddress),
      blockhash,
      lastValidBlockHeight,
    }).add(ownerTransferInstruction, feeTransferInstruction)

    // Get priority fee estimate
    const priorityFee = await getPriorityFeeEstimate(
      legacyTransaction,
      priorityLevel,
    )

    // Create compute budget instructions with safe type conversion
    const computeBudgetInstructions = [
      ComputeBudgetProgram.setComputeUnitLimit({
        units: DEFAULT_COMPUTE_UNIT_LIMIT,
      }),
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityFee,
      }),
    ]

    // Get the latest blockhash for the final transaction
    const finalBlockhash = await connection.getLatestBlockhash()

    // Create transaction with compute budget instructions first
    const message = new TransactionMessage({
      payerKey: new PublicKey(walletAddress),
      recentBlockhash: finalBlockhash.blockhash,
      instructions: [
        ...computeBudgetInstructions,
        ownerTransferInstruction,
        feeTransferInstruction,
      ],
    }).compileToV0Message()

    const transaction = new VersionedTransaction(message)

    // Return the serialized transaction
    return NextResponse.json({
      transaction: Buffer.from(transaction.serialize()).toString('base64'),
    })
  } catch (error: any) {
    console.error('Error building comment fee transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to build comment fee transaction' },
      { status: 500 },
    )
  }
}
