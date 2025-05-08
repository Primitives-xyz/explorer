import { LaunchPoolParams } from '@/types/vertigo'
import { getPayerKeypair } from '@/utils/utils'
import { BN } from '@coral-xyz/anchor'
import {
  getOrCreateAssociatedTokenAccount,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { createVertigoSDK } from './utils'
/**
 * Launch a new liquidity pool for a token
 */
export async function launchPool(
  connection: Connection,
  params: LaunchPoolParams
): Promise<{ signature: string; poolAddress: string; mintB: string }> {
  try {
    const vertigo = createVertigoSDK(connection)
    const payer = getPayerKeypair()

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
    const tokenWalletAuthority = params.existingToken?.walletAuthority
    if (!tokenWalletAuthority) {
      throw new Error('Token wallet authority is required')
    }
    // Get token decimals from the blockchain if using an existing token
    const decimals = 6

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
        royaltiesBps: params.poolParams.feeParams.royaltiesBps,
        feeExemptBuys: params.poolParams.feeParams.feeExemptBuys,
        reference: new BN(0),
      },
    }

    // Launch the pool
    const { deploySignature, poolAddress } = await vertigo.launchPool({
      // Pool configuration
      params: {
        shift: poolParams.shift,
        initialTokenBReserves: poolParams.initialTokenBReserves,
        feeParams: {
          normalizationPeriod: poolParams.feeParams.normalizationPeriod,
          decay: poolParams.feeParams.decay,
          royaltiesBps: poolParams.feeParams.royaltiesBps,
          privilegedSwapper: null,
          reference: new BN(0),
        },
      },

      // Authority configuration
      payer: payer,
      owner: payer,
      tokenWalletAuthority,

      // Token configuration
      tokenWalletB: tokenWallet.address,
      mintA: NATIVE_MINT,
      mintB,
      tokenProgramA: TOKEN_PROGRAM_ID,
      tokenProgramB: TOKEN_2022_PROGRAM_ID,
    })

    return {
      signature: deploySignature,
      poolAddress: poolAddress.toString(),
      mintB: mintB.toString(),
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
    if (error instanceof Error) {
      throw error
    }
    throw new Error(
      `Could not verify ${accountName} (${accountPublicKey.toString()}) on-chain.`
    )
  }
}
