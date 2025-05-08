import {
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
    BLOCKCHAIN_IDS,
  } from '@solana/actions'
  import { Connection, Keypair, PublicKey } from '@solana/web3.js'
  import { NextRequest } from 'next/server'
  import bs58 from 'bs58'
  import * as anchor from '@coral-xyz/anchor'
  import { VertigoSDK } from '@vertigo-amm/vertigo-sdk'
  import { NATIVE_MINT, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
  
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
  
  // Factory nonce (used to identify our factory)
  const FACTORY_NONCE = 0
  
  // OPTIONS endpoint for CORS
  export const OPTIONS = async () => {
    return new Response(null, { headers })
  }
  
  export async function POST(req: NextRequest) {
    console.log("Processing token launch from factory after fee payment")
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
      
      // Get launch parameters from request body
      const requestBody = await req.json()
      const ownerAddress = requestBody.account
      const mintBData = requestBody.mintB
      const tokenConfig = requestBody.tokenConfig
      const initialTokenReserves = requestBody.initialTokenReserves
      const decimals = requestBody.decimals || 9
      const royaltiesBps = requestBody.royaltiesBps || 100
      const initialDevBuy = requestBody.initialDevBuy || 0
      const useToken2022 = requestBody.useToken2022 !== false
      
      console.log('Launch params:', {
        ownerAddress,
        mintB: mintBData.publicKey,
        tokenConfig,
        initialTokenReserves,
        decimals,
        royaltiesBps,
        initialDevBuy,
        useToken2022
      })
      
      if (!ownerAddress || !mintBData || !tokenConfig || !initialTokenReserves) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers }
        )
      }
      
      // Set up the connection
      const connection = new Connection(
        process.env.NEXT_PUBLIC_NETWORK === 'devnet' 
          ? "https://api.devnet.solana.com" 
          : "https://api.mainnet-beta.solana.com", 
        "confirmed"
      )
      
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
      } catch (error) {
        console.error("Error verifying payment:", error)
        return new Response(
          JSON.stringify({ error: `Invalid payment transaction: ${error instanceof Error ? error.message : String(error)}` }),
          { status: 400, headers }
        )
      }
      
      // Process token launch from factory
      console.log(`Launching token ${tokenConfig.name} (${tokenConfig.symbol}) from factory...`)
      
      try {
        // Create wallet wrapper for Anchor
        const wallet = new anchor.Wallet(payer)
        
        // Initialize Vertigo SDK
        const vertigo = new VertigoSDK(connection, wallet)
        
        // Create keypairs for the mint and mint authority
        const mintB = Keypair.fromSecretKey(Buffer.from(mintBData.secretKey))
        const mintBAuthority = Keypair.generate()
        
        // Convert initialTokenReserves to proper format with decimals
        const initialTokenReservesBN = new anchor.BN(initialTokenReserves).muln(10 ** decimals)
        
        // Initialize launch parameters
        const launchParams = {
          tokenConfig: {
            name: tokenConfig.name,
            symbol: tokenConfig.symbol,
            uri: tokenConfig.uri || `https://metadata.example.com/${tokenConfig.symbol.toLowerCase()}.json`,
          },
          privilegedSwapper: initialDevBuy > 0 ? new PublicKey(ownerAddress) : null,
          reference: new anchor.BN(0),
          nonce: FACTORY_NONCE
        }
        
        // Additional parameters for dev buy
        const devBuyParams: any = {}
        
        if (initialDevBuy > 0) {
          console.log(`Setting up initial dev buy of ${initialDevBuy} SOL`)
          
          // Create a devTaA (Token Account A) for the dev
          // This would typically require creating an associated token account
          // For simplicity, we're assuming the dev already has an SOL wallet
          
          devBuyParams.amount = new anchor.BN(initialDevBuy * anchor.web3.LAMPORTS_PER_SOL)
          devBuyParams.limit = new anchor.BN(0)
          devBuyParams.dev = new PublicKey(ownerAddress)
          // devBuyParams.devTaA would need to be set for tokens other than SOL
        }
        
        // Launch token from the factory
        console.log("Executing factory launch...")
        let result
        result = await vertigo.Token2022Factory.launch({
            payer: payer,
            owner: new PublicKey(ownerAddress),
            mintA: NATIVE_MINT,
            mintB: mintB,
            mintBAuthority: mintBAuthority,
            tokenProgramA: TOKEN_PROGRAM_ID,
            tokenProgramB: TOKEN_2022_PROGRAM_ID,
            launchParams,
            ...devBuyParams
          })
          
        // Only supporting Token2022 for now
        // if (useToken2022) {
        //   console.log("Using Token 2022 factory")
        //   result = await vertigo.Token2022Factory.launch({
        //     payer: payer,
        //     owner: new PublicKey(ownerAddress),
        //     mintA: NATIVE_MINT,
        //     mintB: mintB,
        //     mintBAuthority: mintBAuthority,
        //     tokenProgramA: TOKEN_PROGRAM_ID,
        //     tokenProgramB: TOKEN_2022_PROGRAM_ID,
        //     launchParams,
        //     ...devBuyParams
        //   })
        // } else {
        //   console.log("Using SPL Token factory")
        //   result = await vertigo.SPLTokenFactory.launch({
        //     payer: payer,
        //     owner: new PublicKey(ownerAddress),
        //     mintA: NATIVE_MINT,
        //     mintB: mintB,
        //     mintBAuthority: mintBAuthority,
        //     tokenProgramA: TOKEN_PROGRAM_ID,
        //     tokenProgramB: TOKEN_PROGRAM_ID,
        //     launchParams,
        //     ...devBuyParams
        //   })
        // }
        
        console.log('Token launched successfully!')
        console.log(`Pool address: ${result.poolAddress.toString()}`)
        console.log(`Transaction signature: ${result.signature}`)
        
        // Return transaction response
        const response: ActionPostResponse = {
          type: 'transaction',
          transaction: result.signature,
        }
        
        // Include additional data in the response
        const responseObj = {
          ...response,
          poolAddress: result.poolAddress.toString(),
          signature: result.signature,
          mintAddress: mintB.publicKey.toString(),
        }
        
        return new Response(JSON.stringify(responseObj), {
          status: 200,
          headers,
        })
        
      } catch (error: any) {
        console.error('Error launching token from factory:', error)
        return new Response(
          JSON.stringify({
            error: error.message || 'Failed to launch token from factory',
          }),
          { status: 500, headers }
        )
      }
      
    } catch (error: any) {
      console.error('Error in token launch from factory process:', error)
      
      // Return error response
      return new Response(
        JSON.stringify({
          error: error.message || 'Failed to process token launch from factory',
        }),
        { status: 500, headers }
      )
    }
  }