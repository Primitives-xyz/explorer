import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js'
import { addPriorityFee } from './priority-fee'
import { confirmTransactionFast } from './transaction'

async function createATA(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
  priorityLevel: 'Min' | 'Low' | 'Medium' | 'High' | 'VeryHigh' | 'UnsafeMax',
  programId: PublicKey
): Promise<{ ata: PublicKey; wasCreated: boolean }> {
  // Get the ATA address
  const ata = await getAssociatedTokenAddress(
    mint,
    owner,
    false, // Don't allow owner off curve
    programId
  )

  // Check if the account already exists
  const accountInfo = await connection.getAccountInfo(ata)
  if (accountInfo) {
    console.log(
      JSON.stringify(
        {
          operation: 'createATAIfNotExists:exists',
          ata: ata.toString(),
          mint: mint.toString(),
          owner: owner.toString(),
          programId: programId.toString(),
        },
        null,
        2
      )
    )
    return { ata, wasCreated: false }
  }

  // Create the instruction to create the ATA
  const instruction = createAssociatedTokenAccountInstruction(
    payer.publicKey,
    ata,
    owner,
    mint,
    programId
  )

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  // Create transaction
  const transaction = new Transaction({
    feePayer: payer.publicKey,
    blockhash,
    lastValidBlockHeight,
  })

  // Add compute unit limit instruction
  const computeUnitLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
    units: 22_000,
  })
  transaction.add(computeUnitLimitInstruction)

  // Add the ATA creation instruction
  transaction.add(instruction)

  // Add priority fee
  await addPriorityFee(transaction, priorityLevel)

  console.log(
    JSON.stringify(
      {
        operation: 'createATAIfNotExists:sending',
        ata: ata.toString(),
        mint: mint.toString(),
        owner: owner.toString(),
        programId: programId.toString(),
        blockhash,
        lastValidBlockHeight,
        priorityLevel,
      },
      null,
      2
    )
  )

  // Sign and send the transaction
  transaction.sign(payer)
  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    { maxRetries: 5 }
  )

  // Wait for confirmation
  const status = await confirmTransactionFast(connection, signature)

  if (status.err) {
    const errorDetails = {
      operation: 'createATAIfNotExists:error',
      signature,
      ata: ata.toString(),
      mint: mint.toString(),
      owner: owner.toString(),
      programId: programId.toString(),
      error: status.err,
    }
    console.error(JSON.stringify(errorDetails, null, 2))
    throw new Error(`Failed to create ATA: ${JSON.stringify(status.err)}`)
  }

  console.log(
    JSON.stringify(
      {
        operation: 'createATAIfNotExists:success',
        signature,
        ata: ata.toString(),
        mint: mint.toString(),
        owner: owner.toString(),
        programId: programId.toString(),
      },
      null,
      2
    )
  )

  return { ata, wasCreated: true }
}

/**
 * Creates an Associated Token Account (ATA) if it doesn't exist, with Token 2022 fallback
 * @param connection - Solana connection instance
 * @param payer - Keypair of the account paying for the transaction
 * @param mint - PublicKey of the token mint
 * @param owner - PublicKey of the account that will own the ATA
 * @param priorityLevel - Optional priority level for the transaction
 * @returns The ATA address and whether it was newly created
 */
export async function createATAIfNotExists(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
  priorityLevel:
    | 'Min'
    | 'Low'
    | 'Medium'
    | 'High'
    | 'VeryHigh'
    | 'UnsafeMax' = 'Medium'
): Promise<{ ata: PublicKey; wasCreated: boolean }> {
  console.log(
    JSON.stringify(
      {
        operation: 'createATAIfNotExists:start',
        mint: mint.toString(),
        owner: owner.toString(),
        priorityLevel,
      },
      null,
      2
    )
  )

  try {
    // Try with regular Token Program first
    return await createATA(
      connection,
      payer,
      mint,
      owner,
      priorityLevel,
      TOKEN_PROGRAM_ID
    )
  } catch (error) {
    // If we get the Token 2022 error, retry with TOKEN_2022_PROGRAM_ID
    if (
      error instanceof Error &&
      error.message.includes('Please upgrade to SPL Token 2022')
    ) {
      console.log('Retrying with Token 2022 program')
      return await createATA(
        connection,
        payer,
        mint,
        owner,
        priorityLevel,
        TOKEN_2022_PROGRAM_ID
      )
    }
    // If it's a different error, rethrow it
    throw error
  }
}
