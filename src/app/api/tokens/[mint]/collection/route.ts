import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ mint: string }>
}
const ME_API_KEY = process.env.NEXT_ME_API_KEY || ''
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { mint } = params

    if (!mint) {
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
      `https://api-mainnet.magiceden.dev/v2/tokens/${mint}`,
      options
    )
    const data = await response.json()

    return NextResponse.json({
      collection: data.collection || '',
    })
  } catch (error: any) {
    console.error('Error fetching nft collection name:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed nft collection name'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
