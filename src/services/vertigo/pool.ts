import { LaunchPoolParams } from '@/types/vertigo'
import { getPayerKeypair } from '@/utils/utils'
import { BN } from '@coral-xyz/anchor'
import {
  createAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { initializeVertigoProgram } from './utils'

export function getPoolPda(
  owner: PublicKey,
  mintA: PublicKey,
  mintB: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  const POOL_SEED = 'pool'
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(POOL_SEED),
      owner.toBuffer(),
      mintA.toBuffer(),
      mintB.toBuffer(),
    ],
    programId
  )
}

/**
 * Launch a new liquidity pool for a token
 */
export async function launchPool(
  connection: Connection,
  params: LaunchPoolParams & {
    privilegedBuyer?: {
      publicKey: PublicKey
      amount: number
      limit: number
    }
  }
): Promise<{
  signature: string
  poolAddress: string
  mintB: string
  privilegedBuySignature?: string
}> {
  try {
    const payer = getPayerKeypair()

    const program = initializeVertigoProgram(connection)

    // Check if we're using an existing token
    const mintB = params.existingToken?.mintB
    if (!mintB) {
      throw new Error('MintB and tokenWallet must be provided')
    }
    console.log('ABOUT TO GET OR CREATE ASSOCIATED TOKEN ACCOUNT')
    const tokenWallet = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mintB,
      payer.publicKey,
      false,
      'confirmed',
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    )
    console.log('TOKEN ACCOUNT', tokenWallet.address.toString())
    // Use provided wallet authority or generate a new one
    const tokenWalletAuthority = params.existingToken.walletAuthority
    // Get token decimals from the blockchain if using an existing token
    const decimals = 6

    // Set privileged swapper if provided
    const privilegedSwapper = params.privilegedBuyer?.publicKey || null

    // Prepare pool parameters in the format Vertigo SDK expects
    const poolParams = {
      shift: new BN(LAMPORTS_PER_SOL).muln(params.poolParams.shift),
      initialTokenBReserves: new BN(
        params.poolParams.initialTokenReserves * 10 ** decimals
      ),
      feeParams: {
        normalizationPeriod: new BN(
          params.poolParams.feeParams.normalizationPeriod
        ),
        decay: params.poolParams.feeParams.decay,
        reference: new BN(0),
        royaltiesBps: params.poolParams.feeParams.royaltiesBps,
        privilegedSwapper,
      },
    }

    // Launch the pool
    const createPoolResult = await program.methods
      .create(poolParams)
      .accounts({
        owner: payer.publicKey,
        tokenWalletAuthority: tokenWalletAuthority.publicKey,
        tokenWalletB: tokenWallet.address,
        mintA: NATIVE_MINT,
        tokenProgramA: TOKEN_PROGRAM_ID,
        tokenProgramB: TOKEN_2022_PROGRAM_ID,
        mintB: new PublicKey(mintB),
      })
      .signers([tokenWalletAuthority])
      .rpc()

    const [poolAddress, _] = getPoolPda(
      payer.publicKey,
      NATIVE_MINT,
      new PublicKey(mintB),
      program.programId
    )

    // Handle privileged buyer transaction if configured
    let privilegedBuySignature = undefined
    if (
      params.privilegedBuyer &&
      params.privilegedBuyer.amount &&
      params.privilegedBuyer.limit
    ) {
      const dev = params.privilegedBuyer

      // Get or create the dev Token Account A (wSOL)
      const devTaA = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        NATIVE_MINT,
        dev.publicKey,
        false,
        'confirmed',
        { commitment: 'confirmed' },
        TOKEN_PROGRAM_ID
      )

      // Get and create the dev Token Account B if it doesn't exist
      const devTaB = getAssociatedTokenAddressSync(
        mintB,
        dev.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      )

      try {
        await connection.getTokenAccountBalance(devTaB)
      } catch {
        // Create token account if it doesn't exist
        await createAssociatedTokenAccount(
          connection,
          payer,
          mintB,
          dev.publicKey,
          undefined,
          TOKEN_2022_PROGRAM_ID
        )
      }

      console.log('📡 Sending privileged buyer transaction...')

      // Execute the privileged buy
      privilegedBuySignature = await program.methods
        .buy({
          amount: new BN(dev.amount * LAMPORTS_PER_SOL),
          limit: new BN(dev.limit * 10 ** decimals),
        })
        .accounts({
          owner: payer.publicKey,
          user: dev.publicKey,
          mintA: NATIVE_MINT,
          mintB: new PublicKey(mintB),
          userTaA: devTaA.address,
          userTaB: devTaB,
          tokenProgramA: TOKEN_PROGRAM_ID,
          tokenProgramB: TOKEN_2022_PROGRAM_ID,
        })
        .rpc()

      console.log(
        '✅ Privileged buy transaction completed:',
        privilegedBuySignature
      )
    }

    return {
      signature: createPoolResult,
      poolAddress: poolAddress.toString(),
      mintB: mintB.toString(),
      privilegedBuySignature,
    }
  } catch (error: any) {
    console.error('Error launching Vertigo pool:', error)
    throw new Error(`Failed to launch pool: ${error.message}`)
  }
}

/**
 * Verifies that a given Solana account exists on-chain.
 * @param connection - Solana connection object.
 * @param accountPublicKey - The public key of the account to verify.
 * @param accountName - A descriptive name for the account (e.g., "Pool Account") for logging.
 * @throws {Error} If the account is not found or verification fails.
 */
export async function verifySolanaAccount(
  connection: Connection,
  accountPublicKey: PublicKey,
  accountName: string = 'Account'
): Promise<void> {
  try {
    console.log(
      `[verifySolanaAccount] Verifying ${accountName} existence: ${accountPublicKey.toString()}`
    )
    const accountInfo = await connection.getAccountInfo(accountPublicKey)
    if (!accountInfo) {
      console.error(
        `[verifySolanaAccount] ${accountName} NOT FOUND on-chain: ${accountPublicKey.toString()}`
      )
      // More specific error type might be better here
      throw new Error(
        `${accountName} ${accountPublicKey.toString()} not found on-chain.`
      )
    }
    console.log(
      `[verifySolanaAccount] ${accountName} found on-chain. Lamports: ${
        accountInfo.lamports
      }, Owner: ${accountInfo.owner.toString()}`
    )
  } catch (error: any) {
    console.error(
      `[verifySolanaAccount] Error verifying ${accountName} (${accountPublicKey.toString()}):`,
      error
    )
    // Re-throw specific errors or a generic one
    throw error
  }
}
