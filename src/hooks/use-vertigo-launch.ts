import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { VertigoSDK } from "@vertigo-amm/vertigo-sdk"
import { AnchorProvider, Wallet, BN, web3 } from "@coral-xyz/anchor"
import { 
  getOrCreateAssociatedTokenAccount,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token"
import bs58 from 'bs58'

// Default pool settings
const DEFAULT_SHIFT = 100 // 100 virtual SOL
const DEFAULT_NORMALIZATION_PERIOD = 20 // 20 slots
const DEFAULT_DECAY = 10
const DEFAULT_ROYALTIES_BPS = 100 // 1%
const DEFAULT_FEE_EXEMPT_BUYS = 1
const DEFAULT_DEV_BUY_AMOUNT = 1 // 1 virtual SOL

interface LaunchPoolParams {
  connection: Connection
  walletKeypair: Keypair
  mintB: string
  tokenWallet: string
  tokenName: string
  tokenSymbol: string
  shift?: number
  royaltiesBps?: number
  walletAuthority?: string
}

interface LaunchPoolResult {
  signature: string
  poolAddress: string
  mintB: string
}

// Helper function to get token wallet balance in the correct format
async function getTokenWalletBalance(connection: Connection, tokenWallet: PublicKey): Promise<BN> {
  try {
    const tokenAmount = await connection.getTokenAccountBalance(tokenWallet)
    return new BN(tokenAmount.value.amount)
  } catch (error) {
    console.error('Error getting token balance:', error)
    // Return a default value if we can't get the balance
    return new BN(0)
  }
}

export async function launchVertigoPool(params: LaunchPoolParams): Promise<LaunchPoolResult> {
  const {
    connection,
    walletKeypair,
    mintB,
    tokenWallet,
    tokenName,
    tokenSymbol,
    shift = DEFAULT_SHIFT,
    royaltiesBps = DEFAULT_ROYALTIES_BPS,
    walletAuthority
  } = params
  console.log("Launching pool with Vertigo SDK...")

  try {
    console.log("Initializing SDK...")
    // Use standard Wallet instead of NodeWallet
    const wallet = new Wallet(walletKeypair)
    console.log("Wallet initialized", wallet.publicKey.toString())
    console.log("Connection initialized", connection.rpcEndpoint)
    
    // Initialize SDK
    const vertigo = new VertigoSDK(connection, wallet)
    
    // Initialize pool owner and token wallet authority
    const owner = walletKeypair // Owner is the same as payer for simplicity
    
    // Use provided wallet authority or generate a new one
    const tokenWalletAuthority = walletAuthority 
      ? Keypair.fromSecretKey(bs58.decode(walletAuthority))
      : Keypair.generate()
    
    // Generate a dev account for the initial buy
    // This is needed to complete the pool initialization
    const dev = Keypair.generate()
    
    console.log('Funding dev account for initial buy...')
    const airdropSignature = await connection.requestAirdrop(dev.publicKey, 1e9) // 1 SOL
    await connection.confirmTransaction(airdropSignature)
    
    // Create the dev SOL token account
    console.log('Creating dev token accounts...')
    const devTaA = await getOrCreateAssociatedTokenAccount(
      connection,
      walletKeypair,
      NATIVE_MINT,
      dev.publicKey,
      false
    )
    
    // Create the dev mintB token account
    const devTaB = await getOrCreateAssociatedTokenAccount(
      connection,
      walletKeypair,
      new PublicKey(mintB),
      dev.publicKey,
      false,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )
    
    // Create the pool params
    const poolParams = {
      shift: new BN(web3.LAMPORTS_PER_SOL).muln(shift),
      initialTokenBReserves: await getTokenWalletBalance(connection, new PublicKey(tokenWallet)),
      feeParams: {
        normalizationPeriod: new BN(DEFAULT_NORMALIZATION_PERIOD),
        decay: DEFAULT_DECAY,
        royaltiesBps: royaltiesBps,
        feeExemptBuys: DEFAULT_FEE_EXEMPT_BUYS,
        reference: new BN(0),
        privilegedSwapper: null
      },
    }
    
    console.log('Launching pool with the following parameters:')
    console.log('- Mint B:', mintB)
    console.log('- Token Wallet:', tokenWallet)
    console.log('- Shift:', shift, 'virtual SOL')
    console.log('- Royalties BPS:', royaltiesBps)
    console.log('- Token Name:', tokenName)
    console.log('- Token Symbol:', tokenSymbol)
    
    // Launch the pool
    const result = await vertigo.launchPool({
      // Pool configuration
      params: poolParams,

      // Authority configuration
      payer: owner,
      owner: owner,
      tokenWalletAuthority,

      // Token configuration
      tokenWalletB: new PublicKey(tokenWallet),
      mintA: NATIVE_MINT,
      mintB: new PublicKey(mintB),
      tokenProgramA: TOKEN_PROGRAM_ID,
      tokenProgramB: TOKEN_2022_PROGRAM_ID,
      
      // Dev configuration for initial buy
      devBuyAmount: new BN(web3.LAMPORTS_PER_SOL).muln(DEFAULT_DEV_BUY_AMOUNT),
      dev: dev,
      devTaA: devTaA.address,
    })
    
    return {
      signature: result.deploySignature,
      poolAddress: result.poolAddress.toString(),
      mintB
    }
  } catch (error) {
    console.error('Error in launching pool with Vertigo SDK:', error)
    throw error
  }
} 