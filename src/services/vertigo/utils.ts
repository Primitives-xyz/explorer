import { getPayerKeypair, initializeUmi } from '@/utils/utils'
import * as anchor from '@coral-xyz/anchor'
import {
  createNoopSigner,
  signerIdentity,
  transactionBuilder,
} from '@metaplex-foundation/umi'
import {
  fromWeb3JsInstruction,
  fromWeb3JsPublicKey,
} from '@metaplex-foundation/umi-web3js-adapters'
import { base64 } from '@metaplex-foundation/umi/serializers'
import {
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  createCloseAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js'
import ammIdl from '@vertigo-amm/vertigo-sdk/dist/target/idl/amm.json'
import { Amm } from '@vertigo-amm/vertigo-sdk/dist/target/types/amm'

/**
 * Initializes the Vertigo AMM program with a dummy wallet
 * @param connection Solana connection
 * @returns Initialized Anchor program instance
 */
export function initializeVertigoProgram(
  connection: Connection
): anchor.Program<Amm> {
  const payer = getPayerKeypair()
  const wallet = new anchor.Wallet(payer)
  const anchorProvider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  )
  return new anchor.Program<Amm>(ammIdl as Amm, anchorProvider)
}

/**
 * Parses Vertigo transaction errors into user-friendly messages
 * @param error The error to parse
 * @returns A user-friendly error message
 */
export function parseVertigoError(error: any): string {
  console.error('ERROR QUOTING BUY', error)

  let errorMessage = 'Unknown error occurred'

  // Specific handling for Anchor's SimulateError
  if (error && error.constructor?.name === 'SimulateError') {
    console.log('Handling SimulateError specifically')
    const simError = error as { simulationResponse?: { err?: string } }

    if (simError.simulationResponse?.err === 'AccountNotFound') {
      errorMessage = 'Token account not found'
    } else if (simError.simulationResponse?.err) {
      errorMessage = `Simulation error: ${simError.simulationResponse.err}`
    } else {
      // If we couldn't extract a specific error, use a general message
      errorMessage =
        'Failed to simulate transaction on Solana. The token pool might not exist.'
    }
  } else if (error instanceof Error) {
    errorMessage = error.message || 'An error occurred'
  } else {
    errorMessage = String(error || 'Unknown error')
  }

  console.log('Returning error:', errorMessage)
  return errorMessage
}

/**
 * Unwraps wSOL back to SOL by closing the associated token account
 * @param connection Solana connection
 * @param userPublicKey The user's public key
 * @returns Array of instructions to unwrap SOL
 */
export async function unwrapSol(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<TransactionInstruction[]> {
  try {
    // Get the associated token account for wSOL
    const userWsolAta = await getAssociatedTokenAddress(
      NATIVE_MINT,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID
    )

    // Create a transaction to close the wSOL account which unwraps back to SOL
    const closeInstruction = createCloseAccountInstruction(
      userWsolAta, // Token account to close
      userPublicKey, // Destination account (receives SOL)
      userPublicKey, // Owner of token account
      [], // Additional signers (none needed)
      TOKEN_PROGRAM_ID // Token program ID
    )

    return [closeInstruction]
  } catch (error: any) {
    console.error('Error unwrapping SOL:', error)
    throw new Error(
      `Failed to prepare SOL unwrapping transaction: ${error.message}`
    )
  }
}

/**
 * Creates a transaction to unwrap all wSOL back to SOL
 * @param connection Solana connection
 * @param userAddress The user's public key as a string
 * @returns Base64 serialized transaction ready to be signed
 */
export async function createUnwrapSolTransaction(
  connection: Connection,
  userAddress: string
): Promise<string> {
  try {
    const umi = initializeUmi()

    const userPublicKey = new PublicKey(userAddress)

    // Check if the user has a wSOL account
    const userWsolAta = await getAssociatedTokenAddress(
      NATIVE_MINT,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID
    )

    try {
      const accountInfo = await connection.getAccountInfo(userWsolAta)
      if (!accountInfo) {
        throw new Error('No wSOL account found to unwrap')
      }

      // Check wSOL balance
      const balance = await connection.getTokenAccountBalance(userWsolAta)
      console.log(`[unwrapSol] wSOL balance: ${balance.value.amount}`)

      if (Number(balance.value.amount) === 0) {
        throw new Error('wSOL account has zero balance, nothing to unwrap')
      }
    } catch (error: any) {
      console.error('Error checking wSOL account:', error)
      throw new Error(`wSOL account check failed: ${error.message}`)
    }

    // Get unwrap SOL instructions
    const unwrapInstructions = await unwrapSol(connection, userPublicKey)

    if (!unwrapInstructions || unwrapInstructions.length === 0) {
      throw new Error('Failed to create unwrap instruction')
    }

    // Build the transaction
    let tx = transactionBuilder()
    const signer = createNoopSigner(fromWeb3JsPublicKey(userPublicKey))

    // Add unwrap instruction
    const unwrapInstruction = unwrapInstructions[0]
    if (!unwrapInstruction) {
      throw new Error('Unwrap instruction is undefined')
    }

    tx = tx.add({
      instruction: fromWeb3JsInstruction(unwrapInstruction),
      signers: [signer],
      bytesCreatedOnChain: 0,
    })

    umi.use(signerIdentity(signer))
    const unwrapTx = await tx
      .useV0()
      .setBlockhash(await umi.rpc.getLatestBlockhash())
      .buildAndSign(umi)

    // Serialize the transaction
    const serializedTx = umi.transactions.serialize(unwrapTx)
    const serializedTxAsString = base64.deserialize(serializedTx)[0]

    console.log('Returning serialized unwrap transaction.')
    return serializedTxAsString
  } catch (error: any) {
    console.error('Error creating unwrap SOL transaction:', error)
    throw new Error(`Failed to create unwrap transaction: ${error.message}`)
  }
}
