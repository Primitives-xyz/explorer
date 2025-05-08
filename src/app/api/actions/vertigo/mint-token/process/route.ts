import { mintToken } from '@/components/launch/hooks/use-mint-token'
import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from '@solana/actions'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { NextRequest } from 'next/server'
import bs58 from 'bs58'

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

// OPTIONS endpoint for CORS
export const OPTIONS = async () => {
  return new Response(null, { headers })
}

export async function POST(req: NextRequest) {
  console.log("Processing token minting after fee payment")
  try {
    // Get payment transaction from URL params
    const url = new URL(req.url)
    const paymentTxSignature = url.searchParams.get('paymentTx')
    
    if (!paymentTxSignature) {
      return new Response(
        JSON.stringify({ error: 'Missing payment transaction signature' }),
        { status: 400, headers }
      )
    }
    
    // Get mint parameters from request body
    const requestBody = await req.json()
    const ownerAddress = requestBody.account
    const mintParams = requestBody.mintParams
    console.log('Mint params: ', mintParams)
    
    if (!ownerAddress || !mintParams) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers }
      )
    }
    
    // Set up the connection
    const connection = new Connection("https://api.devnet.solana.com", "confirmed")
    
    // Get the payer keypair from environment variable
    const payerPrivateKey = process.env.PAYER_PRIVATE_KEY
    if (!payerPrivateKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing payer credentials' }),
        { status: 500, headers }
      )
    }
    
    const secretKey = bs58.decode(payerPrivateKey)
    const payer = Keypair.fromSecretKey(secretKey)
    
    // Verify payment transaction was confirmed
    try {
      console.log("Verifying payment transaction signature:", paymentTxSignature)
      
      // Get the transaction status
      const signatureStatus = await connection.getSignatureStatus(paymentTxSignature)
      
      if (!signatureStatus || !signatureStatus.value) {
        return new Response(
          JSON.stringify({ error: 'Payment transaction not found' }),
          { status: 400, headers }
        )
      }
      
      if (signatureStatus.value.err) {
        return new Response(
          JSON.stringify({ error: `Payment transaction failed: ${JSON.stringify(signatureStatus.value.err)}` }),
          { status: 400, headers }
        )
      }
      
      const confirmationStatus = signatureStatus.value.confirmationStatus
      if (confirmationStatus !== 'confirmed' && confirmationStatus !== 'finalized') {
        return new Response(
          JSON.stringify({ error: `Payment transaction not confirmed yet: ${confirmationStatus}` }),
          { status: 400, headers }
        )
      }
      
      console.log("Payment transaction confirmed:", confirmationStatus)
      
      // In a production environment, you would also:
      // 1. Retrieve the transaction details to verify it pays the correct amount
      // 2. Check that it was sent to the correct fee wallet
      // 3. Store the payment in a database to prevent double-usage
      
    } catch (error) {
      console.error("Error verifying payment:", error)
      return new Response(
        JSON.stringify({ error: `Invalid payment transaction: ${error instanceof Error ? error.message : String(error)}` }),
        { status: 400, headers }
      )
    }
    
    // Mint the token
    console.log(`Minting token ${mintParams.tokenName} (${mintParams.tokenSymbol})...`)
    
    // Add debug logging for mintKeypair if present
    if (mintParams.mintKeypair) {
      console.log('Using custom mint keypair with public key:', mintParams.mintKeypair.publicKey);
      
      
      // Make sure mintKeypair.secretKey is a valid hex string
      try {
        if (typeof mintParams.mintKeypair.secretKey === 'string') {
          // Test if it's a valid hex string by converting a small part
          const testBuffer = Buffer.from(mintParams.mintKeypair.secretKey.substring(0, 10), 'hex');
          console.log('Secret key format validated as hex string');
        }
      } catch (error) {
        console.error('Error parsing secret key as hex:', error);
        return new Response(
          JSON.stringify({ error: 'Invalid secret key format' }),
          { status: 400, headers }
        );
      }
    } else {
      console.log('No custom mint keypair provided, will generate a random keypair')
    }
    
    const result = await mintToken(connection, payer, mintParams)
    
    console.log('Token minted successfully!')
    console.log(`Mint address: ${result.mint.toString()}`)
    console.log(`Token wallet: ${result.tokenWallet.toString()}`)

    // Return transaction response
    const response: ActionPostResponse = {
      type: 'transaction',
      transaction: result.transaction,
    }

    // Include additional data in the response
    const responseObj = {
      ...response,
      mintAddress: result.mint.toString(),
      tokenWallet: result.tokenWallet.toString(),
      mintAuthority: bs58.encode(result.mintAuthority.secretKey),
    }

    return new Response(JSON.stringify(responseObj), {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Error minting token:', error)

    // Return error response
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to mint token',
      }),
      { status: 500, headers }
    )
  }
} 