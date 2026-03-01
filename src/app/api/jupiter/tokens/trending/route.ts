import { NextRequest, NextResponse } from 'next/server'

const JUPITER_API_KEY = process.env.JUPITER_API_KEY || ''
const JUPITER_TOKENS_V2 = 'https://api.jup.ag/tokens/v2'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'toptraded'
    const interval = searchParams.get('interval') || '24h'
    const limit = searchParams.get('limit') || '20'

    const validCategories = ['toporganicscore', 'toptraded', 'toptrending']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (JUPITER_API_KEY) {
      headers['x-api-key'] = JUPITER_API_KEY
    }

    const url = new URL(`${JUPITER_TOKENS_V2}/${category}/${interval}`)
    url.searchParams.set('limit', limit)

    const response = await fetch(url.toString(), { headers })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Jupiter trending fetch failed' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Jupiter trending tokens:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch trending tokens',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
