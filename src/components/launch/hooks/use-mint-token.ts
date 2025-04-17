'use server'

import { 
  clusterApiUrl,
  Connection, 
  Keypair, 
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { 
  createMint, 
  mintTo, 
  createAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeMetadataPointerInstruction,
  TYPE_SIZE,
  LENGTH_SIZE
} from '@solana/spl-token'
import { 
  createInitializeInstruction, 
  pack, 
  TokenMetadata 
} from '@solana/spl-token-metadata'
import bs58 from 'bs58'

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

/**
 * Function to mint a new Solana token
 */
export async function mintToken(
  connection: Connection,
  payer: Keypair,
  params: MintTokenParams
): Promise<MintedTokenResult> {
  try {
    console.log(`Minting new token: ${params.tokenName} (${params.tokenSymbol})`)
    
    // Use provided mint keypair if available, otherwise generate one
    let mintKeypair: Keypair
    if (params.mintKeypair) {
      const secretKeyBytes = Buffer.from(params.mintKeypair.secretKey, 'hex')
      mintKeypair = Keypair.fromSecretKey(secretKeyBytes)
      
      // Verify the keypair has the correct public key
      if (mintKeypair.publicKey.toString() !== params.mintKeypair.publicKey) {
        throw new Error('Invalid mint keypair: public key mismatch')
      }
    } else {
      mintKeypair = Keypair.generate()
    }
    
    const mint = mintKeypair.publicKey;
    console.log("Mint public key: ", mint.toBase58());
    
    // Fund the payer if needed
    console.log("Ensuring payer has enough SOL")
    const payerBalance = await connection.getBalance(payer.publicKey)
    if (payerBalance < 0.5 * LAMPORTS_PER_SOL) {
      const airdropSignature = await connection.requestAirdrop(payer.publicKey, 1 * LAMPORTS_PER_SOL)
      await connection.confirmTransaction({ 
        signature: airdropSignature, 
        ...(await connection.getLatestBlockhash()) 
      });
    }
    
    // Define the token metadata
    const tokenUri = await getTokenMetadataUri(
      params.tokenName, 
      params.tokenSymbol, 
      params.tokenImage,
      params.tokenDescription
    )
    
    const metadata: TokenMetadata = {
      mint: mint,
      name: params.tokenName,
      symbol: params.tokenSymbol,
      uri: tokenUri,
      additionalMetadata: [["description", params.tokenDescription || `${params.tokenName} token`]],
    };
    
    // Define extensions to be used by the mint
    const extensions = [
      ExtensionType.MetadataPointer,
    ];
    
    // Calculate the length of the mint
    const mintLen = getMintLen(extensions);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    
    // Get minimum balance for rent exemption
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
    
    // Create the transaction to initialize the mint with metadata
    const mintTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports: mintLamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      
      createInitializeMetadataPointerInstruction(
        mint, 
        payer.publicKey, 
        mint, 
        TOKEN_2022_PROGRAM_ID
      ),
      
      createInitializeMintInstruction(
        mint, 
        params.decimals, 
        payer.publicKey, 
        null, 
        TOKEN_2022_PROGRAM_ID
      ),
      
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mint,
        metadata: metadata.mint,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: payer.publicKey,
        updateAuthority: payer.publicKey,
      })
    );
    
    // Send and confirm the transaction
    console.log("Creating token mint")
    const mintTxId = await connection.sendTransaction(mintTransaction, [payer, mintKeypair]);
    await connection.confirmTransaction({ 
      signature: mintTxId, 
      ...(await connection.getLatestBlockhash()) 
    });
    
    // Create the token wallet (associated token account)
    console.log("Creating token wallet")
    const tokenWallet = await createAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )
    
    // Mint initial supply to the wallet
    console.log("Minting initial supply")
    const mintAmount = BigInt(params.initialSupply * Math.pow(10, params.decimals));
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
    });
    
    console.log(`Token ${params.tokenSymbol} minted successfully!`)
    console.log(`Mint address: ${mint.toString()}`)
    console.log(`Token wallet: ${tokenWallet.toString()}`)
    
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
 * Function to get token metadata URI based on the token image
 */
export async function getTokenMetadataUri(
  tokenName: string,
  tokenSymbol: string,
  tokenImage?: string,
  tokenDescription?: string
): Promise<string> {
  // If no image is provided, use a default image
  const imageUrl = tokenImage || 'https://vertigo.xyz/default-token-image.png'
  
  // Create metadata compliant with SPL Token Metadata
  const metadata = {
    name: tokenName,
    symbol: tokenSymbol,
    image: imageUrl,
    description: tokenDescription || `${tokenName} token created via Vertigo Token Launcher`,
    external_url: "https://vertigo.xyz",
    attributes: [
      {
        trait_type: "Created with",
        value: "Vertigo Token Launcher"
      }
    ]
  }
  
  // In a production environment, this should be uploaded to Arweave, IPFS, or another decentralized storage
  // For now, we're just returning the JSON structure encoded as a data URI
  const metadataString = JSON.stringify(metadata)
  const base64Metadata = Buffer.from(metadataString).toString('base64')
  
  return `data:application/json;base64,${base64Metadata}`
} 