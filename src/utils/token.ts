import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from '@solana/web3.js'
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { addPriorityFee } from './priority-fee'
import { confirmTransactionFast } from './transaction'

/**
 * Creates an Associated Token Account (ATA) if it doesn't exist
 * @param connection - Solana connection instance
 * @param payer - Keypair of the account paying for the transaction
 * @param mint - PublicKey of the token mint
 * @param owner - PublicKey of the account that will own the ATA
 * @returns The ATA address and whether it was newly created
 */
export async function createATAIfNotExists(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
): Promise<{ ata: PublicKey; wasCreated: boolean }> {
  // Get the ATA address
  const ata = await getAssociatedTokenAddress(
    mint,
    owner,
    false, // Don't allow owner off curve
  )

  // Check if the account already exists
  const accountInfo = await connection.getAccountInfo(ata)
  if (accountInfo) {
    return { ata, wasCreated: false }
  }

  // Create the instruction to create the ATA
  const instruction = createAssociatedTokenAccountInstruction(
    payer.publicKey, // payer
    ata, // associated token account address
    owner, // owner
    mint, // token mint
  )

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  // Create transaction
  const transaction = new Transaction({
    feePayer: payer.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(instruction)

  // Add priority fee
  await addPriorityFee(transaction, 'Medium')

  // Sign and send the transaction
  transaction.sign(payer)
  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    { maxRetries: 5 },
  )

  console.log('Transaction sent:', signature)

  // Wait for confirmation using our faster confirmation function
  const status = await confirmTransactionFast(connection, signature)

  if (status.err) {
    throw new Error(`Failed to create ATA: ${JSON.stringify(status.err)}`)
  }

  return { ata, wasCreated: true }
}
