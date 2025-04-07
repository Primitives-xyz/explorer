import { VertigoService } from '@/services/vertigo'
import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from '@solana/actions'
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

// Default pool settings
const DEFAULT_SHIFT = 100 // 100 virtual SOL
const DEFAULT_INITIAL_TOKEN_RESERVES = 1_000_000_000 // 1 billion tokens
const DEFAULT_DECIMALS = 9 // 9 decimals
const DEFAULT_NORMALIZATION_PERIOD = 20 // 20 slots
const DEFAULT_DECAY = 10
const DEFAULT_ROYALTIES_BPS = 100 // 1%
const DEFAULT_FEE_EXEMPT_BUYS = 1

// OPTIONS endpoint for CORS
export const OPTIONS = async () => {
  return new Response(null, { headers })
}

export async function GET(req: NextRequest) {
  // This endpoint provides information about the action
  const response: ActionGetResponse = {
    type: 'action',
    icon: '/token-launcher-icon.png', // Make sure this exists in your public folder
    label: 'Launch a Token',
    title: 'Launch your own token and liquidity pool',
    description:
      'Create a new token and launch a liquidity pool with the Vertigo SDK.',
    links: {
      actions: [
        {
          type: 'transaction',
          href: '/api/actions/vertigo/launch-pool',
          label: 'Launch Token Pool',
          parameters: [
            {
              name: 'tokenName',
              label: 'Token Name',
              type: 'text',
              required: true,
            },
            {
              name: 'tokenSymbol',
              label: 'Token Symbol',
              type: 'text',
              required: true,
            },
            {
              name: 'initialTokenReserves',
              label: 'Initial Token Supply',
              type: 'number',
              required: false,
            },
            {
              name: 'shift',
              label: 'Virtual SOL Amount',
              type: 'number',
              required: false,
            },
            {
              name: 'decimals',
              label: 'Token Decimals',
              type: 'number',
              required: false,
            },
            {
              name: 'royaltiesBps',
              label: 'Royalties (basis points)',
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
    // Parse request parameters
    const url = new URL(req.url)
    const tokenName = url.searchParams.get('tokenName')
    const tokenSymbol = url.searchParams.get('tokenSymbol')

    // Get optional parameters or use defaults
    const initialTokenReserves =
      Number(url.searchParams.get('initialTokenReserves')) ||
      DEFAULT_INITIAL_TOKEN_RESERVES
    const shift = Number(url.searchParams.get('shift')) || DEFAULT_SHIFT
    const decimals =
      Number(url.searchParams.get('decimals')) || DEFAULT_DECIMALS
    const royaltiesBps =
      Number(url.searchParams.get('royaltiesBps')) || DEFAULT_ROYALTIES_BPS

    // Get user public key from request body
    const requestBody = await req.json()
    const ownerAddress = requestBody.account

    // Validate required parameters
    if (!tokenName || !tokenSymbol || !ownerAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers }
      )
    }

    // Set up the Vertigo service
    const connection = await VertigoService.createConnection()
    const vertigoService = new VertigoService(connection)

    // Launch the pool
    const result = await vertigoService.launchPool({
      tokenName,
      tokenSymbol,
      poolParams: {
        shift,
        initialTokenReserves,
        decimals,
        feeParams: {
          normalizationPeriod: DEFAULT_NORMALIZATION_PERIOD,
          decay: DEFAULT_DECAY,
          royaltiesBps,
          feeExemptBuys: DEFAULT_FEE_EXEMPT_BUYS,
        },
      },
      ownerAddress,
    })

    // Return transaction response
    const response: ActionPostResponse = {
      type: 'transaction',
      transaction: result.signature,
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Error launching token pool:', error)

    // Return error response
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to launch token pool',
      }),
      { status: 500, headers }
    )
  }
}
