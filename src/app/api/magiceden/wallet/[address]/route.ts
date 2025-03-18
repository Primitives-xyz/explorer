import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ address: string }>
}
const ME_API_KEY = process.env.NEXT_ME_API_KEY || ''
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { address } = params

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
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
      `https://api-mainnet.magiceden.dev/v2/wallets/${address}/tokens`,
      options
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch wallet tokens: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching wallet tokens:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed fetching wallet tokens'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
