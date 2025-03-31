import { SSE_TOKEN_MINT } from '@/constants/jupiter'
import { addPriorityFee } from '@/utils/priority-fee'
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
const DEFAULT_COMPUTE_UNIT_LIMIT = 200_000 // Increased for multiple transfers
const MAX_RECIPIENTS_PER_TX = 3 // Maximum recipients per transaction to avoid size limits

interface AirdropRequest {
  walletAddresses: string[] // List of recipient wallet addresses
  amounts: string[] // Corresponding amounts for each wallet (in token base units)
  priorityLevel?: 'Min' | 'Low' | 'Medium' | 'High' | 'VeryHigh' | 'UnsafeMax'
}

async function createAirdropTransaction(
  payer: Keypair,
  sourceTokenAccount: PublicKey,
  destinationTokenAccounts: PublicKey[],
  amounts: string[],
  priorityLevel: 'Min' | 'Low' | 'Medium' | 'High' | 'VeryHigh' | 'UnsafeMax'
): Promise<VersionedTransaction> {
  // Create a basic transaction for fee estimation
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()
  const legacyTransaction = new Transaction({
    feePayer: payer.publicKey,
    blockhash,
    lastValidBlockHeight,
  })

  // Create transfer instructions for each recipient
  const transferInstructions = destinationTokenAccounts.map(
    (destinationTokenAccount, index) => {
      return createTransferInstruction(
        sourceTokenAccount,
        destinationTokenAccount,
        payer.publicKey,
        BigInt(amounts[index]),
        [],
        TOKEN_PROGRAM_ID
      )
    }
  )

  // Add transfer instructions to the transaction for fee estimation
  transferInstructions.forEach((instruction) => {
    legacyTransaction.add(instruction)
  })

  // Estimate priority fee
  await addPriorityFee(legacyTransaction, priorityLevel)

  // Extract the computed priority fee instruction
  const priorityFeeInstruction = legacyTransaction.instructions[0]

  // Get a fresh blockhash for the final transaction
  const finalBlockhash = await connection.getLatestBlockhash()

  // Create compute budget instruction
  const computeBudgetInstruction = ComputeBudgetProgram.setComputeUnitLimit({
    units: DEFAULT_COMPUTE_UNIT_LIMIT,
  })

  // Create a versioned transaction
  const message = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: finalBlockhash.blockhash,
    instructions: [
      computeBudgetInstruction,
      priorityFeeInstruction,
      ...transferInstructions,
    ],
  }).compileToV0Message()

  const transaction = new VersionedTransaction(message)

  // Sign the transaction with the payer (fee wallet)
  transaction.sign([payer])

  return transaction
}

export async function POST(request: Request) {
  try {
    const {
      walletAddresses,
      amounts,
      priorityLevel = 'Medium',
    } = (await request.json()) as AirdropRequest

    // Validate input
    if (
      !walletAddresses ||
      !amounts ||
      !Array.isArray(walletAddresses) ||
      !Array.isArray(amounts) ||
      walletAddresses.length === 0 ||
      walletAddresses.length !== amounts.length
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid request. Must provide equal length arrays of walletAddresses and amounts.',
        },
        { status: 400 }
      )
    }

    // Get the payer's keypair for creating ATAs if needed
    const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY
    if (!PRIVATE_KEY) {
      throw new Error('PAYER_PRIVATE_KEY is not set')
    }
    const secretKey = bs58.decode(PRIVATE_KEY)
    const payer = Keypair.fromSecretKey(secretKey)

    // Get the source token account (FEE_WALLET's ATA for SSE tokens)
    const sourceTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(SSE_TOKEN_MINT),
      new PublicKey(payer.publicKey)
    )

    // Create or verify ATAs for all recipients
    console.log(
      `Creating or verifying ATAs for ${walletAddresses.length} recipients`
    )
    const destinationTokenAccounts: PublicKey[] = []

    // Track wallet status
    const walletStatuses: Record<string, { success: boolean; error?: string }> =
      {}

    for (let i = 0; i < walletAddresses.length; i++) {
      try {
        const walletAddress = walletAddresses[i]
        walletStatuses[walletAddress] = { success: false }

        const { ata: destinationTokenAccount } = await createATAIfNotExists(
          connection,
          payer,
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(walletAddress),
          priorityLevel
        )

        destinationTokenAccounts.push(destinationTokenAccount)
      } catch (error: any) {
        console.error(
          `Error creating ATA for wallet ${walletAddresses[i]}: ${error.message}`
        )
        walletStatuses[walletAddresses[i]] = {
          success: false,
          error: `Error creating ATA: ${error.message}`,
        }
        // Continue with other wallets instead of stopping the whole operation
      }
    }

    // If there are too many recipients, split into batches
    const signatures: string[] = []
    const validWallets = walletAddresses.filter(
      (addr) =>
        !walletStatuses[addr].error && destinationTokenAccounts.length > 0
    )
    const validDestinations = destinationTokenAccounts.filter(
      (_account, index) => !walletStatuses[walletAddresses[index]].error
    )
    const validAmounts = amounts.filter(
      (_amount, index) => !walletStatuses[walletAddresses[index]].error
    )

    try {
      if (validWallets.length <= MAX_RECIPIENTS_PER_TX) {
        // Process in a single transaction
        const transaction = await createAirdropTransaction(
          payer,
          sourceTokenAccount,
          validDestinations,
          validAmounts,
          priorityLevel
        )

        const signature = await connection.sendTransaction(transaction)
        signatures.push(signature)

        // Mark all wallets in this batch as successful
        validWallets.forEach((walletAddr) => {
          walletStatuses[walletAddr].success = true
        })
      } else {
        // Process in batches
        console.log(
          `Splitting airdrop into batches of ${MAX_RECIPIENTS_PER_TX}`
        )

        for (let i = 0; i < validWallets.length; i += MAX_RECIPIENTS_PER_TX) {
          const batchWallets = validWallets.slice(i, i + MAX_RECIPIENTS_PER_TX)
          const batchDestinations = validDestinations.slice(
            i,
            i + MAX_RECIPIENTS_PER_TX
          )
          const batchAmounts = validAmounts.slice(i, i + MAX_RECIPIENTS_PER_TX)

          const transaction = await createAirdropTransaction(
            payer,
            sourceTokenAccount,
            batchDestinations,
            batchAmounts,
            priorityLevel
          )

          const signature = await connection.sendTransaction(transaction)
          signatures.push(signature)

          // Mark all wallets in this batch as successful
          batchWallets.forEach((walletAddr) => {
            walletStatuses[walletAddr].success = true
          })

          // Wait a short time between batches
          if (i + MAX_RECIPIENTS_PER_TX < validWallets.length) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        }
      }
    } catch (error: any) {
      console.error('Error processing airdrop transaction:', error)
      // If a batch fails, mark remaining wallets as failed
      validWallets.forEach((walletAddr) => {
        if (!walletStatuses[walletAddr].success) {
          walletStatuses[
            walletAddr
          ].error = `Transaction failed: ${error.message}`
        }
      })
    }

    return NextResponse.json({
      success: signatures.length > 0,
      signatures,
      numRecipients: walletAddresses.length,
      tokenMint: SSE_TOKEN_MINT,
      numBatches: signatures.length,
      walletStatuses,
    })
  } catch (error: any) {
    console.error('Error processing airdrop:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process airdrop' },
      { status: 500 }
    )
  }
}
