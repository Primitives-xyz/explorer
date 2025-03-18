import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ mintAddress: string }>
}
const ME_API_KEY = process.env.NEXT_ME_API_KEY || ''
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { mintAddress } = params

    if (!mintAddress) {
      return NextResponse.json(
        { error: 'Token mint address is required' },
        { status: 400 }
      )
    }

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ME_API_KEY}`,
      },
    }
    const response = await fetch(
      `https://api-mainnet.magiceden.dev/v2/tokens/${mintAddress}`,
      options
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch token metadata: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching token metadata:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed fetching token metadata'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
