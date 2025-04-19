

import * as anchor from "@coral-xyz/anchor";
import { BN } from '@coral-xyz/anchor'
import {
  createAssociatedTokenAccount,
  createMint,
  mintTo,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js'
import { VertigoSDK } from '@vertigo-amm/vertigo-sdk'
import bs58 from 'bs58'

// Configuration
const VERTIGO_CONFIG = {
  FEE_WALLET: process.env.FEE_WALLET || '',
  PAYER_PRIVATE_KEY: process.env.PAYER_PRIVATE_KEY || '',
}

export interface PoolParams {
  shift: number // Virtual SOL amount
  initialTokenReserves: number // Initial token supply
  decimals: number // Token decimals
  feeParams: {
    normalizationPeriod: number
    decay: number
    royaltiesBps: number
    feeExemptBuys: number
  }
}

export interface LaunchPoolParams {
  tokenName: string
  tokenSymbol: string
  tokenImage?: string
  poolParams: PoolParams
  ownerAddress: string
  existingToken?: {
    mintB: PublicKey
    tokenWallet: PublicKey
    walletAuthority?: Keypair
  }
}

export interface BuyTokensParams {
  poolOwner: string
  mintA: string
  mintB: string
  userAddress: string
  userTaA: string
  userTaB: string
  amount: number
  slippageBps?: number
}

export interface SellTokensParams {
  poolOwner: string
  mintA: string
  mintB: string
  userAddress: string
  userTaA: string
  userTaB: string
  amount: number
  slippageBps?: number
}

export interface ClaimRoyaltiesParams {
  poolAddress: string
  mintA: string
  receiverTaA: string
  ownerAddress: string
}

// Helper function to get payer keypair
function getPayerKeypair(): Keypair {
  if (!VERTIGO_CONFIG.PAYER_PRIVATE_KEY) {
    throw new Error('PAYER_PRIVATE_KEY is not set')
  }
  const secretKey = bs58.decode(VERTIGO_CONFIG.PAYER_PRIVATE_KEY)
  return Keypair.fromSecretKey(secretKey)
}

// Helper function to create Vertigo SDK instance
function createVertigoSDK(connection: Connection): VertigoSDK {
  const payer = getPayerKeypair()
  const wallet = new anchor.Wallet(payer)

  try {
    // Add a try-catch and more debugging
    console.log('Creating VertigoSDK with:', {
      connectionEndpoint: connection.rpcEndpoint,
      wallet: wallet.constructor.name
    })
    
    // Create with optional empty config to avoid any defaults causing issues
    return new VertigoSDK(connection, wallet)
  } catch (error) {
    console.error('Error creating VertigoSDK:', error)
    throw error
  }
}

/**
 * Launch a new liquidity pool for a token
 */
export async function launchPool(
  connection: Connection,
  params: LaunchPoolParams
): Promise<{ signature: string; poolAddress: string; mintB: string }> {
  try {
    console.log('Initializing Vertigo SDK...')
    const vertigo = createVertigoSDK(connection)
    console.log('Vertigo SDK initialized')
    const payer = getPayerKeypair()

    // Generate keypairs for the pool
    const owner = Keypair.fromSecretKey(payer.secretKey)
    
    let mintB: PublicKey
    let tokenWallet: PublicKey
    let tokenWalletAuthority: Keypair
    
    // Check if we're using an existing token
    if (params.existingToken) {
      console.log('Using existing token for pool creation')
      mintB = params.existingToken.mintB
      tokenWallet = params.existingToken.tokenWallet
      // Use provided wallet authority or generate a new one
      tokenWalletAuthority = params.existingToken.walletAuthority || Keypair.generate()
    } else {
      // Proceed with the normal token creation flow
      tokenWalletAuthority = Keypair.generate()
      const mintAuthority = Keypair.generate()
      const mint = Keypair.generate()

      // Fund the token wallet authority account
      await connection.requestAirdrop(
        tokenWalletAuthority.publicKey,
        LAMPORTS_PER_SOL * 0.1
      )

      // Fund the mint authority account
      await connection.requestAirdrop(
        mintAuthority.publicKey,
        LAMPORTS_PER_SOL * 0.1
      )

      // Create the custom token (mintB)
      const decimals = params.poolParams.decimals
      mintB = await createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        null, // No freeze authority
        decimals,
        mint,
        undefined,
        TOKEN_2022_PROGRAM_ID
      )

      // Create the token wallet for the mint
      tokenWallet = await createAssociatedTokenAccount(
        connection,
        payer,
        mint.publicKey,
        tokenWalletAuthority.publicKey,
        undefined,
        TOKEN_2022_PROGRAM_ID
      )

      // Mint tokens to the wallet
      const initialTokenReserves = params.poolParams.initialTokenReserves
      await mintTo(
        connection,
        payer,
        mint.publicKey,
        tokenWallet,
        mintAuthority.publicKey,
        initialTokenReserves * Math.pow(10, decimals),
        [mintAuthority],
        undefined,
        TOKEN_2022_PROGRAM_ID
      )
    }

    // Get token decimals from the blockchain if using an existing token
    const decimals = params.existingToken 
      ? (await connection.getTokenSupply(mintB)).value.decimals
      : params.poolParams.decimals

    // Prepare pool parameters in the format Vertigo SDK expects
    const poolParams = {
      shift: new BN(LAMPORTS_PER_SOL).muln(params.poolParams.shift),
      initialTokenBReserves: params.existingToken
        ? await getTokenWalletBalance(connection, tokenWallet, decimals)
        : new BN(params.poolParams.initialTokenReserves).muln(Math.pow(10, decimals)),
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
      payer: owner,
      owner,
      tokenWalletAuthority,

      // Token configuration
      tokenWalletB: tokenWallet,
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

// Helper function to get token wallet balance in the correct format for Vertigo SDK
async function getTokenWalletBalance(connection: Connection, tokenWallet: PublicKey, decimals: number): Promise<BN> {
  try {
    const tokenAmount = await connection.getTokenAccountBalance(tokenWallet)
    return new BN(tokenAmount.value.amount)
  } catch (error) {
    console.error('Error getting token balance:', error)
    // Return a default value if we can't get the balance
    return new BN(1_000_000_000).muln(Math.pow(10, decimals))
  }
}

/**
 * Buy tokens from a Vertigo pool
 */
export async function buyTokens(
  connection: Connection,
  params: BuyTokensParams
): Promise<string> {
  try {
    const vertigo = createVertigoSDK(connection)

    // Convert string addresses to PublicKeys
    const owner = new PublicKey(params.poolOwner)
    const mintA = new PublicKey(params.mintA)
    const mintB = new PublicKey(params.mintB)
    const userAddress = new PublicKey(params.userAddress)
    const userTaA = new PublicKey(params.userTaA)
    const userTaB = new PublicKey(params.userTaB)

    // Create user keypair (note: in a real implementation, this would come from a signature)
    const user = Keypair.generate()

    // Convert amount to lamports
    const amount = new BN(params.amount * LAMPORTS_PER_SOL)

    // Execute the buy transaction
    const signature = await vertigo.buy({
      owner,
      user,
      mintA,
      mintB,
      userTaA,
      userTaB,
      tokenProgramA: TOKEN_PROGRAM_ID,
      tokenProgramB: TOKEN_2022_PROGRAM_ID,
      params: {
        amount,
        limit: new BN(0),
      },
    })

    return signature
  } catch (error: any) {
    console.error('Error buying tokens from Vertigo pool:', error)
    throw new Error(`Failed to buy tokens: ${error.message}`)
  }
}

/**
 * Sell tokens to a Vertigo pool
 */
export async function sellTokens(
  connection: Connection,
  params: SellTokensParams
): Promise<string> {
  try {
    const vertigo = createVertigoSDK(connection)

    // Convert string addresses to PublicKeys
    const owner = new PublicKey(params.poolOwner)
    const mintA = new PublicKey(params.mintA)
    const mintB = new PublicKey(params.mintB)
    const userAddress = new PublicKey(params.userAddress)
    const userTaA = new PublicKey(params.userTaA)
    const userTaB = new PublicKey(params.userTaB)

    // Create user keypair (note: in a real implementation, this would come from a signature)
    const user = Keypair.generate()

    // Retrieve token decimals
    const tokenInfo = await connection.getTokenSupply(mintB)
    const decimals = tokenInfo.value.decimals

    // Convert amount with the correct decimals
    const amount = new BN(params.amount * Math.pow(10, decimals))

    // Execute the sell transaction
    const signature = await vertigo.sell({
      owner,
      mintA,
      mintB,
      user,
      userTaA,
      userTaB,
      tokenProgramA: TOKEN_PROGRAM_ID,
      tokenProgramB: TOKEN_2022_PROGRAM_ID,
      params: {
        amount,
        limit: new BN(0),
      },
    })

    return signature
  } catch (error: any) {
    console.error('Error selling tokens to Vertigo pool:', error)
    throw new Error(`Failed to sell tokens: ${error.message}`)
  }
}

/**
 * Claim royalty fees from a Vertigo pool
 */
export async function claimRoyalties(
  connection: Connection,
  params: ClaimRoyaltiesParams
): Promise<string> {
  try {
    const vertigo = createVertigoSDK(connection)
    const payer = getPayerKeypair()

    // Convert string addresses to PublicKeys
    const pool = new PublicKey(params.poolAddress)
    const mintA = new PublicKey(params.mintA)
    const receiverTaA = new PublicKey(params.receiverTaA)
    const claimer = Keypair.fromSecretKey(payer.secretKey)

    // Execute the claim royalties transaction
    const signature = await vertigo.claimRoyalties({
      pool,
      claimer,
      mintA,
      receiverTaA,
      tokenProgramA: TOKEN_PROGRAM_ID,
    })

    return signature
  } catch (error: any) {
    console.error('Error claiming royalties from Vertigo pool:', error)
    throw new Error(`Failed to claim royalties: ${error.message}`)
  }
}

// Helper function to create a connection
export async function createConnection(): Promise<Connection> {
  return new Connection(
    'https://api.devnet.solana.com', "confirmed"
  )
  // return new Connection(
  //   process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
  // )
}