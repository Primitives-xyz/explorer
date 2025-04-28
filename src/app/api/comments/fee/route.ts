import type { PriorityLevel } from '@/types/jupiter'
import { createATAIfNotExists } from '@/utils/token'
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import bs58 from 'bs58'
import { NextResponse } from 'next/server'

const connection = new Connection(process.env.RPC_URL || '')
const HELIUS_API_KEY = process.env.HELIUS_API_KEY
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
const SSE_TOKEN_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'
const FEE_WALLET = '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'
const COMMENT_FEE_AMOUNT = 100_000_000 // 100 SSE (assuming 6 decimals)
const DEFAULT_COMPUTE_UNIT_LIMIT = 15_000

interface CommentFeeRequest {
  walletAddress: string // Commenter's wallet
  targetWalletAddress: string // Profile owner's wallet
  priorityLevel?: PriorityLevel // Optional priority level
}

async function getPriorityFeeEstimate(
  transaction: Transaction,
  priorityLevel: PriorityLevel = 'Medium'
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

  console.log('Full API Response:', JSON.stringify(data, null, 2))
  console.log('Priority Fee Levels:', data.result?.priorityFeeLevels)
  console.log('Selected Priority Level:', priorityLevel)

  // Ensure we have a valid priority fee value
  const priorityFee =
    data.result?.priorityFeeLevels?.[priorityLevel.toLowerCase()]
  console.log('Selected Priority Fee:', priorityFee)

  if (typeof priorityFee !== 'number' || isNaN(priorityFee)) {
    console.log('Invalid priority fee value, defaulting to 1000')
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
          new PublicKey(walletAddress)
        ),
        getAssociatedTokenAddress(
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(targetWalletAddress)
        ),
        getAssociatedTokenAddress(
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(FEE_WALLET)
        ),
      ])

    // Check if accounts exist and create them if they don't
    const [sourceInfo, ownerInfo, feeInfo] = await Promise.all([
      connection.getAccountInfo(sourceTokenAccount),
      connection.getAccountInfo(ownerTokenAccount),
      connection.getAccountInfo(feeTokenAccount),
    ])

    // Get the payer's keypair for creating ATAs if needed
    const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY
    if (!PRIVATE_KEY) {
      throw new Error('PAYER_PRIVATE_KEY is not set')
    }
    const secretKey = bs58.decode(PRIVATE_KEY)
    const payer = Keypair.fromSecretKey(secretKey)

    // Create missing ATAs if needed
    const ataCreationPromises = []

    if (!sourceInfo) {
      ataCreationPromises.push(
        createATAIfNotExists(
          connection,
          payer,
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(walletAddress)
        )
      )
    }

    if (!ownerInfo) {
      ataCreationPromises.push(
        createATAIfNotExists(
          connection,
          payer,
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(targetWalletAddress)
        )
      )
    }

    if (!feeInfo) {
      ataCreationPromises.push(
        createATAIfNotExists(
          connection,
          payer,
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(FEE_WALLET)
        )
      )
    }

    // Wait for all ATA creations to complete if any were needed
    if (ataCreationPromises.length > 0) {
      await Promise.all(ataCreationPromises)
    }

    // Create transfer instructions
    const ownerTransferInstruction = createTransferInstruction(
      sourceTokenAccount,
      ownerTokenAccount,
      new PublicKey(walletAddress),
      BigInt(ownerAmount),
      [],
      TOKEN_PROGRAM_ID
    )

    const feeTransferInstruction = createTransferInstruction(
      sourceTokenAccount,
      feeTokenAccount,
      new PublicKey(walletAddress),
      BigInt(feeAmount),
      [],
      TOKEN_PROGRAM_ID
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
      priorityLevel
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
      { status: 500 }
    )
  }
}
