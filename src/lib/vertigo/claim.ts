import { ClaimRoyaltiesParams } from '@/types/vertigo'
import * as anchor from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { VertigoSDK } from '@vertigo-amm/vertigo-sdk/'
import bs58 from 'bs58'

// Function to get the server's keypair (replace with actual implementation)
// This likely involves reading from environment variables, similar to launch-pool
function getServerKeypair(): Keypair {
  const secretKey = process.env.VERTIGO_SECRET_KEY // Or a dedicated claimer key?
  if (!secretKey) {
    throw new Error(
      'Server configuration error: Missing secret key for claiming.'
    )
  }
  return Keypair.fromSecretKey(bs58.decode(secretKey))
}

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
    console.warn(
      `[verifyPoolExists] Error verifying pool ${poolAddress}:`,
      error
    )
    // Return false if account doesn't exist or other error occurs
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
    // Check if account exists and is owned by the token program
    return !!accountInfo && accountInfo.owner.equals(TOKEN_PROGRAM_ID)
  } catch (error) {
    console.warn(
      `[verifyTokenAccountExists] Error checking token account ${tokenAccount}:`,
      error
    )
    // Return false if account doesn't exist or other error occurs
    return false
  }
}

/**
 * Claim royalty fees from a Vertigo pool.
 * This function executes the claim transaction using the server's keypair
 * and returns the transaction signature.
 * The server's keypair acts as the 'claimer'. The royalties are sent to the 'receiverTaA'.
 *
 * @param connection - Solana connection
 * @param params - Parameters for claiming royalties { poolAddress, mintA, receiverTaA, ownerAddress }
 * @returns The transaction signature as a string.
 */
export async function claimPoolRoyalties(
  connection: Connection,
  params: ClaimRoyaltiesParams
): Promise<string> {
  try {
    console.log(
      `[claimPoolRoyalties] Claiming royalties for pool: ${params.poolAddress}`
    )
    console.log(`[claimPoolRoyalties] Mint A (Royalty Token): ${params.mintA}`)
    console.log(
      `[claimPoolRoyalties] Receiver Token Account: ${params.receiverTaA}`
    )
    console.log(
      `[claimPoolRoyalties] User Requesting Claim (Owner): ${params.ownerAddress}`
    ) // For logging/context

    // 1. Verify the pool exists
    if (!(await verifyPoolExists(connection, params.poolAddress))) {
      throw new Error(`Pool does not exist: ${params.poolAddress}`)
    }

    // 2. Verify the receiver token account exists
    if (!(await verifyTokenAccountExists(connection, params.receiverTaA))) {
      throw new Error(
        `Receiver token account does not exist: ${params.receiverTaA}. Please ensure it's created.`
      )
    }

    // 3. Create Vertigo SDK instance with the server's wallet
    const serverKeypair = getServerKeypair() // Server acts as the claimer
    const wallet = new anchor.Wallet(serverKeypair)
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    })
    const vertigo = new VertigoSDK(connection, wallet)

    // 4. Convert string addresses to PublicKeys
    const pool = new PublicKey(params.poolAddress)
    const mintA = new PublicKey(params.mintA)
    const receiverTaA = new PublicKey(params.receiverTaA)

    // 5. Execute the claim royalties transaction using the server's keypair
    const signature = await vertigo.claimRoyalties({
      pool,
      claimer: serverKeypair, // Use the server wallet as claimer
      mintA,
      receiverTaA,
      tokenProgramA: TOKEN_PROGRAM_ID, // Assuming royalties are paid in Mint A (e.g., SOL/wSOL)
    })

    // Remove serialization logic
    // const tx = await vertigo.claimRoyalties(...);
    // tx.feePayer = serverKeypair.publicKey;
    // const serializedTx = tx.serialize(...).toString('base64');

    console.log(
      `[claimPoolRoyalties] Successfully claimed royalties for pool: ${params.poolAddress}, Tx: ${signature}`
    )
    return signature // Return the signature directly
  } catch (error: any) {
    console.error('[claimPoolRoyalties] Error claiming royalties:', error)
    // Improve error message clarity
    const detailedMessage = error?.message || 'Unknown error'
    if (
      error instanceof Error &&
      error.message.includes('Pool does not exist')
    ) {
      throw new Error(`Claim failed: ${error.message}`) // Propagate specific errors
    }
    if (
      error instanceof Error &&
      error.message.includes('Receiver token account does not exist')
    ) {
      throw new Error(`Claim failed: ${error.message}`)
    }
    if (
      error instanceof Error &&
      error.message.includes('Missing secret key')
    ) {
      // Don't expose internal server config errors directly
      throw new Error(`Claim failed due to server configuration issue.`)
    }
    // General error
    throw new Error(`Failed to claim royalties: ${detailedMessage}`)
  }
}
