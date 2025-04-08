import { VertigoService } from '@/services/vertigo'
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

// OPTIONS endpoint for CORS
export const OPTIONS = async () => {
  return new Response(null, { headers })
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const poolAddress = searchParams.get('poolAddress')

  if (!poolAddress) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameter: poolAddress' }),
      { status: 400, headers }
    )
  }

  // Create title and description
  const title = `Claim Royalties`
  const description = `Claim royalty fees from your Vertigo liquidity pool.`

  const response: ActionGetResponse = {
    type: 'action',
    icon: '/royalties-icon.png', // Make sure this exists in your public folder
    label: 'Claim Royalties',
    title,
    description,
    links: {
      actions: [
        {
          type: 'transaction',
          href: `/api/actions/vertigo/claim-royalties?poolAddress=${poolAddress}`,
          label: 'Claim Royalties',
          parameters: [],
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
    const poolAddress = url.searchParams.get('poolAddress')

    // Get user wallet address from request body
    const requestBody = await req.json()
    const ownerAddress = requestBody.account

    if (!poolAddress || !ownerAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers }
      )
    }

    // Initialize Vertigo service
    const connection = await VertigoService.createConnection()
    const vertigoService = new VertigoService(connection)

    // We need the SOL token account for the receiver
    // For a real implementation, you'd need to fetch this or create it if it doesn't exist
    // Here we're simulating this part
    const receiverTaA = `PLACEHOLDER_RECEIVER_TA_A_ADDRESS` // This would be the owner's SOL token account

    // Execute the claim royalties transaction
    const signature = await vertigoService.claimRoyalties({
      poolAddress,
      mintA: NATIVE_MINT.toString(),
      receiverTaA,
      ownerAddress,
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
    console.error('Error claiming royalties from pool:', error)

    // Return error response
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to claim royalties' }),
      { status: 500, headers }
    )
  }
}
