import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js'

/**
 * Creates a transfer instruction for SSE tokens
 * @param connection - Solana connection
 * @param fromTokenAccount - Source token account
 * @param toTokenAccount - Destination token account
 * @param owner - Owner of the source token account
 * @param amount - Amount to transfer in raw units
 */
export async function createSSETransferInstruction(
  connection: Connection,
  fromTokenAccount: PublicKey,
  toTokenAccount: PublicKey,
  owner: PublicKey,
  amount: string | number
): Promise<TransactionInstruction> {
  const amountBigInt = BigInt(amount)

  return createTransferInstruction(
    fromTokenAccount,
    toTokenAccount,
    owner,
    amountBigInt,
    [],
    TOKEN_PROGRAM_ID
  )
}

/**
 * Creates a transfer instruction with automatic ATA creation if needed
 * @param connection - Solana connection
 * @param tokenMint - Token mint address
 * @param from - Source wallet address
 * @param to - Destination wallet address
 * @param amount - Amount to transfer in raw units
 * @param feePayer - Fee payer for ATA creation
 */
export async function createSSETransferWithATAInstruction(
  connection: Connection,
  tokenMint: PublicKey,
  from: PublicKey,
  to: PublicKey,
  amount: string | number,
  feePayer: PublicKey
): Promise<TransactionInstruction[]> {
  const instructions: TransactionInstruction[] = []

  // Get associated token accounts
  const fromTokenAccount = await getAssociatedTokenAddress(tokenMint, from)
  const toTokenAccount = await getAssociatedTokenAddress(tokenMint, to)

  // Check if destination ATA exists
  const toAccountInfo = await connection.getAccountInfo(toTokenAccount)

  // Create ATA if it doesn't exist
  if (!toAccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        feePayer,
        toTokenAccount,
        to,
        tokenMint
      )
    )
  }

  // Add transfer instruction
  instructions.push(
    await createSSETransferInstruction(
      connection,
      fromTokenAccount,
      toTokenAccount,
      from,
      amount
    )
  )

  return instructions
}
