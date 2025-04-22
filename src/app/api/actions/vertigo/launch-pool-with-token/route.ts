import { createConnection, launchPool } from '@/lib/vertigo'
import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from '@solana/actions'
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NextRequest } from 'next/server'
import bs58 from 'bs58'
import * as anchor from '@coral-xyz/anchor'
import { 
  getOrCreateAssociatedTokenAccount, 
  NATIVE_MINT, 
  TOKEN_2022_PROGRAM_ID 
} from '@solana/spl-token'

// Set blockchain (mainnet or devnet)
const blockchain =
  process.env.NEXT_PUBLIC_NETWORK === 'devnet'
    ? BLOCKCHAIN_IDS.devnet
    : BLOCKCHAIN_IDS.mainnet

// Headers for the Actions API
const headers = {
  ...ACTIONS_CORS_HEADERS,
  'x-blockchain-ids': blockchain,
  'x-action-version': '2.4',
}

// Default pool settings
const DEFAULT_SHIFT = 100 // 100 virtual SOL
const DEFAULT_ROYALTIES_BPS = 100 // 1%

// OPTIONS endpoint for CORS
export const OPTIONS = async () => {
  return new Response(null, { headers })
}

export async function POST(req: NextRequest) {
  try {
    console.log('Launching pool with existing token...')
    // Parse request parameters
    const url = new URL(req.url)
    const mintB = url.searchParams.get('mintB')
    const tokenWallet = url.searchParams.get('tokenWallet')
    const tokenName = url.searchParams.get('tokenName')
    const tokenSymbol = url.searchParams.get('tokenSymbol')
    const initialTokenBReserves = new anchor.BN(url.searchParams.get('initialTokenBReserves') || 1_000_000_000)

    // Get optional parameters or use defaults
    const shift = Number(url.searchParams.get('shift')) || DEFAULT_SHIFT
    const royaltiesBps =
      Number(url.searchParams.get('royaltiesBps')) || DEFAULT_ROYALTIES_BPS
    const tokenImage = url.searchParams.get('tokenImage') || undefined
    const initialDevBuy = Number(url.searchParams.get('initialDevBuy'))

    // Get user public key from request body
    const requestBody = await req.json()
    const ownerAddress = requestBody.account
    
    //Console log all the parameters
    console.log('Mint B: ', mintB)
    console.log('Token Wallet: ', tokenWallet)
    console.log('Token Name: ', tokenName)
    console.log('Token Symbol: ', tokenSymbol)
    console.log('Initial Token B Reserves: ', initialTokenBReserves)
    console.log('Shift: ', shift)
    console.log('Royalties Bps: ', royaltiesBps)
    console.log('Token Image: ', tokenImage)
    console.log('Initial Dev Buy: ', initialDevBuy)
    console.log('Owner Address: ', ownerAddress)
    

    // Validate required parameters
    if (!mintB || !tokenWallet || !tokenName || !tokenSymbol || !ownerAddress || !initialTokenBReserves) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers }
      )
    }

    // Set up the connection
    const connection = await createConnection()

    // Check that the mint and token wallet exist
    try {
      // Check that the mint exists
      const mintInfo = await connection.getAccountInfo(new PublicKey(mintB))
      if (!mintInfo) {
        return new Response(
          JSON.stringify({ error: 'Invalid mint address: Token does not exist' }),
          { status: 400, headers }
        )
      }

      // Check that the token wallet exists
      const walletInfo = await connection.getAccountInfo(new PublicKey(tokenWallet))
      if (!walletInfo) {
        return new Response(
          JSON.stringify({ error: 'Invalid token wallet address: Wallet does not exist' }),
          { status: 400, headers }
        )
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to verify token addresses' }),
        { status: 400, headers }
      )
    }

    // Load wallet keypair from local file
    const walletKeypair = Keypair.fromSecretKey(
      bs58.decode(process.env.PAYER_PRIVATE_KEY!)
    );
    const wallet = new anchor.Wallet(walletKeypair)

    // Create user token accounts for dev buy if initialDevBuy is provided
    let devBuyParams = {}
    
    if (initialDevBuy > 0) {
      console.log(`Setting up dev buy for ${initialDevBuy} SOL`)
      
      // Create a keypair for the dev user (using owner's address for the token accounts)
      const dev = Keypair.fromSecretKey(
        bs58.decode(process.env.PAYER_PRIVATE_KEY!)
      );

      console.log('Dev: public address: ', dev.publicKey.toString())
      
      try {
        
        // Get or create the dev's SOL token account
        const devTaA = await getOrCreateAssociatedTokenAccount(
          connection,
          wallet.payer,
          NATIVE_MINT,
          dev.publicKey, // Use the dev keypair's public key, not owner address
          false
        )
        
        // Get or create the dev's token B account
        const devTaB = await getOrCreateAssociatedTokenAccount(
          connection,
          wallet.payer,
          new PublicKey(mintB),
          new PublicKey(ownerAddress), // Token B goes to the owner
          false,
          undefined,
          undefined,
          TOKEN_2022_PROGRAM_ID
        )
        
        // Add dev buy parameters
        devBuyParams = {
          amount: new anchor.BN(LAMPORTS_PER_SOL).muln(initialDevBuy),
          limit: new anchor.BN(0),
          dev: walletKeypair,
          devTaA: devTaA.address,
        }
        
        console.log('Dev buy parameters set up successfully as ', devBuyParams)
      } catch (error) {
        console.error('Error setting up dev buy token accounts:', error)
        // Continue without dev buy if there's an error setting up the accounts
      }
    }

    // Launch the pool using our extracted hook
    console.log(`Launching pool for token ${tokenName} (${tokenSymbol})...`)
    console.log(`Using mint: ${mintB}`)
    console.log(`Using wallet: ${tokenWallet}`)
    console.log(`Using owner address: ${ownerAddress}`)
    
    // For existing token pools, we need to use the wallet keypair as the walleßt authority
    // since the error shows "owner does not match"
    console.log("About to launch pool...")
    
    // Merge launch parameters with dev buy parameters if present
    const launchParams = {
      tokenName,
      tokenSymbol,
      tokenImage: tokenImage,
      poolParams: {
        shift,
        // These parameters need to be set but will be fetched from the blockchain for existing tokens
        initialTokenReserves: initialTokenBReserves,
        decimals: 0,
        feeParams: {
          normalizationPeriod: 20,
          decay: 10,
          royaltiesBps,
          feeExemptBuys: 1
        }
      },
      ownerAddress,
      existingToken: {
        mintB: new PublicKey(mintB),
        tokenWallet: new PublicKey(tokenWallet),
        // Use the loaded wallet keypair as the authority since it likely owns the token account
        walletAuthority: walletKeypair
      },
      ...devBuyParams // Add dev buy parameters if set
    };
    
    const result = await launchPool(connection, launchParams);

    console.log('Pool launched successfully!')
    console.log(`Pool address: ${result.poolAddress}`)
    console.log(`Transaction: ${result.signature}`)

    // Return transaction response
    const response: ActionPostResponse = {
      type: 'transaction',
      transaction: result.signature,
    }

    // Include additional data in the response
    const responseObj = {
      ...response,
      mintB,
      poolAddress: result.poolAddress
    }

    return new Response(JSON.stringify(responseObj), {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Error launching pool with existing token:', error)

    // Return error response
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to launch pool with existing token',
      }),
      { status: 500, headers }
    )
  }
} 