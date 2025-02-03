import { NextResponse } from 'next/server'

const HELIUS_API_KEY = process.env.HELIUS_API_KEY
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

export type PriorityLevel =
  | 'Min'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax'

export async function POST(request: Request) {
  try {
    const {
      transaction,
      priorityLevel = 'Medium',
      options = {},
    } = await request.json()

    if (!HELIUS_API_KEY) {
      throw new Error('HELIUS_API_KEY is not configured')
    }

    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-priority-fee',
        method: 'getPriorityFeeEstimate',
        params: [
          {
            transaction,
            options: {
              ...options,
              priorityLevel,
              includeAllPriorityFeeLevels: true,
            },
          },
        ],
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return NextResponse.json(data.result)
  } catch (error) {
    console.error('Priority fee estimation failed:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to estimate priority fee',
      },
      { status: 500 },
    )
  }
}
