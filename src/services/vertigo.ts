import * as anchor from '@coral-xyz/anchor'
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
import { VertigoSDK } from '@vertigo-amm/vertigo-sdk/dist/src/sdk'
import bs58 from 'bs58'

// Configuration
export const VERTIGO_CONFIG = {
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

export class VertigoService {
  private connection: Connection
  private vertigo: VertigoSDK
  private payer: Keypair

  constructor(connection: Connection) {
    this.connection = connection
    this.payer = this.getPayerKeypair()
    // Initialize the wallet with the payer
    const wallet = new anchor.Wallet(this.payer)
    this.vertigo = new VertigoSDK(connection, wallet)
  }

  private getPayerKeypair(): Keypair {
    if (!VERTIGO_CONFIG.PAYER_PRIVATE_KEY) {
      throw new Error('PAYER_PRIVATE_KEY is not set')
    }
    const secretKey = bs58.decode(VERTIGO_CONFIG.PAYER_PRIVATE_KEY)
    return Keypair.fromSecretKey(secretKey)
  }

  /**
   * Launch a new liquidity pool for a token
   */
  public async launchPool(
    params: LaunchPoolParams
  ): Promise<{ signature: string; poolAddress: string; mintB: string }> {
    try {
      // Generate keypairs for the pool
      const owner = Keypair.fromSecretKey(this.payer.secretKey)
      const tokenWalletAuthority = Keypair.generate()
      const mintAuthority = Keypair.generate()
      const mint = Keypair.generate()

      // Fund the token wallet authority account
      await this.connection.requestAirdrop(
        tokenWalletAuthority.publicKey,
        LAMPORTS_PER_SOL * 0.1
      )

      // Fund the mint authority account
      await this.connection.requestAirdrop(
        mintAuthority.publicKey,
        LAMPORTS_PER_SOL * 0.1
      )

      // Create the custom token (mintB)
      const decimals = params.poolParams.decimals
      const mintB = await createMint(
        this.connection,
        this.payer,
        mintAuthority.publicKey,
        null, // No freeze authority
        decimals,
        mint,
        undefined,
        TOKEN_2022_PROGRAM_ID
      )

      // Create the token wallet for the mint
      const tokenWallet = await createAssociatedTokenAccount(
        this.connection,
        this.payer,
        mint.publicKey,
        tokenWalletAuthority.publicKey,
        undefined,
        TOKEN_2022_PROGRAM_ID
      )

      // Mint tokens to the wallet
      const initialTokenReserves = params.poolParams.initialTokenReserves
      await mintTo(
        this.connection,
        this.payer,
        mint.publicKey,
        tokenWallet,
        mintAuthority.publicKey,
        initialTokenReserves * Math.pow(10, decimals),
        [mintAuthority],
        undefined,
        TOKEN_2022_PROGRAM_ID
      )

      // Prepare pool parameters in the format Vertigo SDK expects
      const poolParams = {
        shift: new anchor.BN(LAMPORTS_PER_SOL).muln(params.poolParams.shift),
        initialTokenBReserves: new anchor.BN(
          params.poolParams.initialTokenReserves
        ).muln(Math.pow(10, decimals)),
        feeParams: {
          normalizationPeriod: new anchor.BN(
            params.poolParams.feeParams.normalizationPeriod
          ),
          decay: params.poolParams.feeParams.decay,
          royaltiesBps: params.poolParams.feeParams.royaltiesBps,
          feeExemptBuys: params.poolParams.feeParams.feeExemptBuys,
          reference: new anchor.BN(0),
        },
      }

      // Launch the pool
      const { signature, poolAddress } = await this.vertigo.launchPool({
        // Pool configuration
        poolParams,

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
        signature,
        poolAddress: poolAddress.toString(),
        mintB: mintB.toString(),
      }
    } catch (error: any) {
      console.error('Error launching Vertigo pool:', error)
      throw new Error(`Failed to launch pool: ${error.message}`)
    }
  }

  /**
   * Buy tokens from a Vertigo pool
   */
  public async buyTokens(params: BuyTokensParams): Promise<string> {
    try {
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
      const amount = new anchor.BN(params.amount * LAMPORTS_PER_SOL)

      // Execute the buy transaction
      const signature = await this.vertigo.buy({
        owner,
        user,
        mintA,
        mintB,
        userTaA,
        userTaB,
        tokenProgramA: TOKEN_PROGRAM_ID,
        tokenProgramB: TOKEN_2022_PROGRAM_ID,
        amount,
        limit: new anchor.BN(0),
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
  public async sellTokens(params: SellTokensParams): Promise<string> {
    try {
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
      const tokenInfo = await this.connection.getTokenSupply(mintB)
      const decimals = tokenInfo.value.decimals

      // Convert amount with the correct decimals
      const amount = new anchor.BN(params.amount * Math.pow(10, decimals))

      // Execute the sell transaction
      const signature = await this.vertigo.sell({
        owner,
        mintA,
        mintB,
        user,
        userTaA,
        userTaB,
        tokenProgramA: TOKEN_PROGRAM_ID,
        tokenProgramB: TOKEN_2022_PROGRAM_ID,
        amount,
        limit: new anchor.BN(0),
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
  public async claimRoyalties(params: ClaimRoyaltiesParams): Promise<string> {
    try {
      // Convert string addresses to PublicKeys
      const pool = new PublicKey(params.poolAddress)
      const mintA = new PublicKey(params.mintA)
      const receiverTaA = new PublicKey(params.receiverTaA)
      const claimer = Keypair.fromSecretKey(this.payer.secretKey)

      // Execute the claim royalties transaction
      const signature = await this.vertigo.claimRoyalties({
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

  // Static method to create a connection
  public static async createConnection(): Promise<Connection> {
    return new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    )
  }
}
