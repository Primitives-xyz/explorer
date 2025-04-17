import { createConnection, launchPool } from '@/lib/vertigo'
import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from '@solana/actions'
import { Keypair, PublicKey } from '@solana/web3.js'
import { NextRequest } from 'next/server'
import bs58 from 'bs58'
import os from 'os'
import fs from 'fs'

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

// export async function GET(req: NextRequest) {
//   // This endpoint provides information about the action
//   const response: ActionGetResponse = {
//     type: 'action',
//     icon: '/token-launcher-icon.png',
//     label: 'Launch a Pool with Existing Token',
//     title: 'Launch a liquidity pool for an existing token',
//     description:
//       'Create a new liquidity pool for an already minted token with the Vertigo SDK.',
//     links: {
//       actions: [
//         {
//           type: 'transaction',
//           href: '/api/actions/vertigo/launch-pool-with-token',
//           label: 'Launch Pool with Token',
//           parameters: [
//             {
//               name: 'mintB',
//               label: 'Token Mint Address',
//               type: 'text',
//               required: true,
//             },
//             {
//               name: 'tokenWallet',
//               label: 'Token Wallet Address',
//               type: 'text',
//               required: true,
//             },
//             {
//               name: 'tokenName',
//               label: 'Token Name',
//               type: 'text',
//               required: true,
//             },
//             {
//               name: 'tokenSymbol',
//               label: 'Token Symbol',
//               type: 'text',
//               required: true,
//             },
//             {
//               name: 'shift',
//               label: 'Virtual SOL Amount',
//               type: 'number',
//               required: false,
//             },
//             {
//               name: 'royaltiesBps',
//               label: 'Royalties (basis points)',
//               type: 'number',
//               required: false,
//             },
//           ],
//         },
//       ],
//     },
//   }

//   return new Response(JSON.stringify(response), {
//     status: 200,
//     headers,
//   })
// }

export async function POST(req: NextRequest) {
  console.log("Lwtf")
  try {
    console.log('Launching pool with existing token...')
    // Parse request parameters
    const url = new URL(req.url)
    const mintB = url.searchParams.get('mintB')
    const tokenWallet = url.searchParams.get('tokenWallet')
    const tokenName = url.searchParams.get('tokenName')
    const tokenSymbol = url.searchParams.get('tokenSymbol')

    // Get optional parameters or use defaults
    const shift = Number(url.searchParams.get('shift')) || DEFAULT_SHIFT
    const royaltiesBps =
      Number(url.searchParams.get('royaltiesBps')) || DEFAULT_ROYALTIES_BPS
    const tokenImage = url.searchParams.get('tokenImage') || undefined

    // Get wallet authority parameters
    const walletAuthority = url.searchParams.get('walletAuthority') || undefined

    // Get user public key from request body
    const requestBody = await req.json()
    const ownerAddress = requestBody.account

    // Validate required parameters
    if (!mintB || !tokenWallet || !tokenName || !tokenSymbol || !ownerAddress) {
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
      console.log('Mint exists')

      // Check that the token wallet exists
      const walletInfo = await connection.getAccountInfo(new PublicKey(tokenWallet))
      if (!walletInfo) {
        return new Response(
          JSON.stringify({ error: 'Invalid token wallet address: Wallet does not exist' }),
          { status: 400, headers }
        )
      }
      console.log('Token wallet exists')
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to verify token addresses' }),
        { status: 400, headers }
      )
    }

    // Load wallet keypair from local file
    const pathToWallet = `${os.homedir()}/.config/solana/id.json`;
    const walletKeypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(pathToWallet, "utf-8")))
    );

    // Launch the pool using our extracted hook
    console.log(`Launching pool for token ${tokenName} (${tokenSymbol})...`)
    console.log(`Using mint: ${mintB}`)
    console.log(`Using wallet: ${tokenWallet}`)
    

    console.log("About to launch pool...")
    const result = await launchPool(connection, {
      tokenName,
      tokenSymbol,
      tokenImage: tokenImage,
      poolParams: {
        shift,
        // These parameters need to be set but will be fetched from the blockchain for existing tokens
        initialTokenReserves: 0,
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
        walletAuthority: walletAuthority ? Keypair.fromSecretKey(bs58.decode(walletAuthority)) : undefined
      }
    });

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