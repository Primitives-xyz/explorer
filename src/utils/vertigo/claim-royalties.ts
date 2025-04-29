import { getPayerKeypair } from '@/lib/vertigo'
import { ClaimRoyaltiesParams } from '@/types/vertigo'
import * as anchor from '@coral-xyz/anchor'
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { VertigoSDK } from '@vertigo-amm/vertigo-sdk/'
/**
 * Verify that a pool exists
 * @param connection - Solana connection
 * @param poolAddress - The pool address to verify
 * @returns A boolean indicating if the pool exists
 */
export async function verifyPoolExists(
  connection: Connection,
  poolAddress: string
): Promise<boolean> {
  try {
    const poolInfo = await connection.getAccountInfo(new PublicKey(poolAddress))
    return !!poolInfo
  } catch (error) {
    console.error('Error verifying pool:', error)
    return false
  }
}

/**
 * Verify that a token account exists
 * @param connection - Solana connection
 * @param tokenAccount - The token account address to verify
 * @returns A boolean indicating if the token account exists
 */
export async function verifyTokenAccountExists(
  connection: Connection,
  tokenAccount: string
): Promise<boolean> {
  try {
    const accountInfo = await connection.getAccountInfo(
      new PublicKey(tokenAccount)
    )
    return !!accountInfo
  } catch (error) {
    console.error('Error checking token account:', error)
    return false
  }
}

/**
 * Get or create the associated token account for a mint and owner
 * @param connection - Solana connection
 * @param mintAddress - The mint address
 * @param ownerAddress - The owner's public key
 * @param tokenProgramId - The token program ID
 * @returns The address of the token account
 */
export async function getOrCreateTokenAccount(
  connection: Connection,
  mintAddress: string,
  ownerAddress: string,
  tokenProgramId: PublicKey = TOKEN_PROGRAM_ID
): Promise<string> {
  try {
    const mintPublicKey = new PublicKey(mintAddress)
    const ownerPublicKey = new PublicKey(ownerAddress)
    const payer = getPayerKeypair()

    // Try to use the sync function first to avoid a transaction
    const tokenAccount = getAssociatedTokenAddressSync(
      mintPublicKey,
      ownerPublicKey,
      false,
      tokenProgramId
    ).toString()

    // Check if the account exists
    if (!(await verifyTokenAccountExists(connection, tokenAccount))) {
      // If it doesn't exist, create it
      const { address } = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintPublicKey,
        ownerPublicKey,
        false,
        'confirmed',
        { commitment: 'confirmed' },
        tokenProgramId
      )

      return address.toString()
    }

    return tokenAccount
  } catch (error: any) {
    console.error('Error getting or creating token account:', error)
    throw new Error(`Failed to get or create token account: ${error.message}`)
  }
}

/**
 * Claim royalty fees from a Vertigo pool with expanded functionality
 * @param connection - Solana connection
 * @param params - Parameters for claiming royalties
 * @returns The transaction signature
 */
export async function claimPoolRoyalties(
  connection: Connection,
  params: ClaimRoyaltiesParams
): Promise<string> {
  try {
    console.log(`Claiming royalties from pool: ${params.poolAddress}`)
    console.log(`Using mint A: ${params.mintA}`)
    console.log(`Receiver token account: ${params.receiverTaA}`)

    // Verify the pool exists
    if (!(await verifyPoolExists(connection, params.poolAddress))) {
      throw new Error(`Pool does not exist: ${params.poolAddress}`)
    }

    // Verify the token account exists or create it
    if (!(await verifyTokenAccountExists(connection, params.receiverTaA))) {
      throw new Error(`Token account does not exist: ${params.receiverTaA}`)
    }

    // Create Vertigo SDK instance with the server's wallet
    const payer = getPayerKeypair()
    const wallet = new anchor.Wallet(payer)
    const vertigo = new VertigoSDK(connection, wallet)

    // Convert string addresses to PublicKeys
    const pool = new PublicKey(params.poolAddress)
    const mintA = new PublicKey(params.mintA)
    const receiverTaA = new PublicKey(params.receiverTaA)

    // Execute the claim royalties transaction
    const signature = await vertigo.claimRoyalties({
      pool,
      claimer: payer, // Use the server wallet as claimer
      mintA,
      receiverTaA,
      tokenProgramA: TOKEN_PROGRAM_ID,
    })

    console.log(`Royalties claimed successfully! Transaction: ${signature}`)
    return signature
  } catch (error: any) {
    console.error('Error claiming royalties from Vertigo pool:', error)
    throw new Error(`Failed to claim royalties: ${error.message}`)
  }
}
