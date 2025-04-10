import { createConnection, sellTokens } from '@/lib/vertigo'
import { SwapService } from '@/services/swap'
import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from '@solana/actions'
import { NATIVE_MINT } from '@solana/spl-token'
import { NextRequest } from 'next/server'

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

// Default values
const DEFAULT_SLIPPAGE_BPS = 50 // 0.5%

// OPTIONS endpoint for CORS
export const OPTIONS = async () => {
  return new Response(null, { headers })
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const poolOwner = searchParams.get('poolOwner')
  const mintB = searchParams.get('mintB')

  if (!poolOwner || !mintB) {
    return new Response(
      JSON.stringify({
        error: 'Missing required parameters: poolOwner, mintB',
      }),
      { status: 400, headers }
    )
  }

  // Create title and description
  const title = `Sell Tokens to Pool`
  const description = `Sell tokens to a Vertigo liquidity pool.`

  const response: ActionGetResponse = {
    type: 'action',
    icon: '/token-seller-icon.png', // Make sure this exists in your public folder
    label: 'Sell Tokens',
    title,
    description,
    links: {
      actions: [
        {
          type: 'transaction',
          href: `/api/actions/vertigo/sell-tokens?poolOwner=${poolOwner}&mintB=${mintB}`,
          label: 'Sell Tokens',
          parameters: [
            {
              name: 'amount',
              label: 'Amount of Tokens',
              type: 'number',
              required: true,
            },
            {
              name: 'slippageBps',
              label: 'Slippage (%)',
              type: 'number',
              required: false,
            },
          ],
        },
      ],
    },
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  })
}

export async function POST(req: NextRequest) {
  try {
    // Extract parameters from request
    const url = new URL(req.url)
    const poolOwner = url.searchParams.get('poolOwner')
    const mintB = url.searchParams.get('mintB')
    const amount = url.searchParams.get('amount')
    const slippageBps =
      Number(url.searchParams.get('slippageBps')) || DEFAULT_SLIPPAGE_BPS

    // Get user wallet address from request body
    const requestBody = await req.json()
    const userAddress = requestBody.account

    if (!poolOwner || !mintB || !amount || !userAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers }
      )
    }

    // Initialize Vertigo service
    const connection = await createConnection()

    // We need to look up the user's token accounts for SOL and the target token
    // For a real implementation, you'd need to fetch these or create them if they don't exist
    // Here we're simulating this part
    const swapService = new SwapService(connection)
    const userTaA = await swapService.verifyOrCreateATA(
      NATIVE_MINT.toString(),
      userAddress
    )

    const userTaB = await swapService.verifyOrCreateATA(mintB, userAddress)

    // Execute the sell transaction
    const signature = await sellTokens(connection, {
      poolOwner,
      mintA: NATIVE_MINT.toString(),
      mintB,
      userAddress,
      userTaA: userTaA.toString(),
      userTaB: userTaB.toString(),
      amount: Number(amount),
      slippageBps,
    })

    // Return transaction response
    const response: ActionPostResponse = {
      type: 'transaction',
      transaction: signature,
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Error selling tokens to pool:', error)

    // Return error response
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to sell tokens' }),
      { status: 500, headers }
    )
  }
}
