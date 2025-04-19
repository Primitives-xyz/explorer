'use server'

import { 
  Connection, 
  Keypair, 
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'

import { 
  createAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeMetadataPointerInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  mintTo
} from '@solana/spl-token'

import { 
  createInitializeInstruction, 
  pack, 
  TokenMetadata 
} from '@solana/spl-token-metadata'

// Types
export interface MintTokenParams {
  tokenName: string
  tokenSymbol: string
  initialSupply: number
  decimals: number
  tokenImage?: string
  tokenDescription?: string
  mintKeypair?: {
    publicKey: string
    secretKey: string
  }
}

export interface MintedTokenResult {
  mint: PublicKey
  tokenWallet: PublicKey
  mintAuthority: Keypair
  transaction: string
}

// Constants
const DEFAULT_TOKEN_IMAGE = 'https://vertigo.xyz/default-token-image.png'
const MIN_PAYER_BALANCE = 0.5 * LAMPORTS_PER_SOL
const AIRDROP_AMOUNT = 1 * LAMPORTS_PER_SOL

/**
 * Creates a base64-encoded metadata URI for token
 */
export async function getTokenMetadataUri(
  tokenName: string,
  tokenSymbol: string,
  tokenImage?: string,
  tokenDescription?: string
): Promise<string> {
  const imageUrl = tokenImage || DEFAULT_TOKEN_IMAGE
  const description = tokenDescription || `${tokenName} token created via Vertigo Token Launcher`
  
  const metadata = {
    name: tokenName,
    symbol: tokenSymbol,
    image: imageUrl,
    description,
    external_url: "https://vertigo.xyz",
    attributes: [
      {
        trait_type: "Created with",
        value: "Vertigo Token Launcher"
      }
    ]
  }
  
  // For production: upload to Arweave/IPFS instead of using data URI
  const metadataString = JSON.stringify(metadata)
  const base64Metadata = Buffer.from(metadataString).toString('base64')
  
  return `data:application/json;base64,${base64Metadata}`
}

/**
 * Mints a new Solana token with metadata
 */
export async function mintToken(
  connection: Connection,
  payer: Keypair,
  params: MintTokenParams
): Promise<MintedTokenResult> {
  try {
    console.log(`Minting new token paid for by ${payer.publicKey.toString()} with params:`, params)
    
    const mintKeypair = getMintKeypair(params.mintKeypair)
    const mint = mintKeypair.publicKey
    console.log("Mint public key:", mint.toBase58())
    
    await ensurePayerHasFunds(connection, payer)
    
    const { mintTransaction, metadata } = await createMintTransaction(
      connection,
      mint,
      payer,
      params
    )
    
    // Send and confirm mint creation transaction
    console.log("Creating token mint")
    const mintTxId = await sendAndConfirmTransaction(
      connection,
      mintTransaction,
      [payer, mintKeypair]
    )
    
    // Create token account and mint initial supply
    const tokenWallet = await createTokenWallet(connection, payer, mint)
    await mintInitialSupply(connection, payer, mint, tokenWallet, params)
    
    logSuccessInfo(params.tokenSymbol, mint, tokenWallet)
    
    return {
      mint,
      tokenWallet,
      mintAuthority: payer,
      transaction: mintTxId
    }
  } catch (error: any) {
    console.error('Error minting token:', error)
    throw new Error(`Failed to mint token: ${error.message}`)
  }
}

/**
 * Gets or creates a mint keypair
 */
function getMintKeypair(mintKeypairParam?: { publicKey: string, secretKey: string }): Keypair {
  if (!mintKeypairParam) {
    return Keypair.generate()
  }
  
  const secretKeyBytes = Buffer.from(mintKeypairParam.secretKey, 'hex')
  const keypair = Keypair.fromSecretKey(secretKeyBytes)
  
  // Verify keypair has the correct public key
  if (keypair.publicKey.toString() !== mintKeypairParam.publicKey) {
    throw new Error('Invalid mint keypair: public key mismatch')
  }
  
  return keypair
}

/**
 * Ensures payer has enough SOL by airdropping if needed
 */
async function ensurePayerHasFunds(connection: Connection, payer: Keypair): Promise<void> {
  console.log("Ensuring payer has enough SOL")
  const payerBalance = await connection.getBalance(payer.publicKey)
  
  if (payerBalance < MIN_PAYER_BALANCE) {
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey, 
      AIRDROP_AMOUNT
    )
    
    await connection.confirmTransaction({ 
      signature: airdropSignature, 
      ...(await connection.getLatestBlockhash()) 
    })
  }
}

/**
 * Creates the transaction to initialize the token mint with metadata
 */
async function createMintTransaction(
  connection: Connection,
  mint: PublicKey,
  payer: Keypair,
  params: MintTokenParams
): Promise<{ mintTransaction: Transaction, metadata: TokenMetadata }> {
  // Create token metadata
  const tokenUri = await getTokenMetadataUri(
    params.tokenName, 
    params.tokenSymbol, 
    params.tokenImage,
    params.tokenDescription
  )
  
  const metadata: TokenMetadata = {
    mint,
    name: params.tokenName,
    symbol: params.tokenSymbol,
    uri: tokenUri,
    additionalMetadata: [["description", params.tokenDescription || `${params.tokenName} token`]],
  }
  
  // Calculate required space and lamports
  const extensions = [ExtensionType.MetadataPointer]
  const mintLen = getMintLen(extensions)
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length
  const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen)
  
  // Create transaction with all instructions
  const mintTransaction = new Transaction().add(
    // Create account for the mint
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    
    // Initialize metadata pointer
    createInitializeMetadataPointerInstruction(
      mint, 
      payer.publicKey, 
      mint, 
      TOKEN_2022_PROGRAM_ID
    ),
    
    // Initialize mint
    createInitializeMintInstruction(
      mint, 
      params.decimals, 
      payer.publicKey, 
      null, 
      TOKEN_2022_PROGRAM_ID
    ),
    
    // Initialize metadata
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint,
      metadata: metadata.mint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    })
  )
  
  return { mintTransaction, metadata }
}

/**
 * Creates token wallet (associated token account)
 */
async function createTokenWallet(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey
): Promise<PublicKey> {
  console.log("Creating token wallet")
  return await createAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
    undefined,
    TOKEN_2022_PROGRAM_ID
  )
}

/**
 * Mints initial supply to the token wallet
 */
async function mintInitialSupply(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  tokenWallet: PublicKey,
  params: MintTokenParams
): Promise<void> {
  console.log("Minting initial supply")
  const mintAmount = BigInt(params.initialSupply * Math.pow(10, params.decimals))
  
  const mintToTx = await mintTo(
    connection,
    payer,
    mint,
    tokenWallet,
    payer.publicKey,
    mintAmount,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID
  )
  
  await connection.confirmTransaction({ 
    signature: mintToTx, 
    ...(await connection.getLatestBlockhash()) 
  })
}

/**
 * Sends and confirms a transaction
 */
async function sendAndConfirmTransaction(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[]
): Promise<string> {
  const txId = await connection.sendTransaction(transaction, signers)
  await connection.confirmTransaction({ 
    signature: txId, 
    ...(await connection.getLatestBlockhash()) 
  })
  return txId
}

/**
 * Logs successful token creation information
 */
function logSuccessInfo(tokenSymbol: string, mint: PublicKey, tokenWallet: PublicKey): void {
  console.log(`Token ${tokenSymbol} minted successfully!`)
  console.log(`Mint address: ${mint.toString()}`)
  console.log(`Token wallet: ${tokenWallet.toString()}`)
} 