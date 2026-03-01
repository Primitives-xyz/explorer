import { NextRequest, NextResponse } from 'next/server'

const JUPITER_API_KEY = process.env.JUPITER_API_KEY || ''
const JUPITER_TOKENS_V2 = 'https://api.jup.ag/tokens/v2'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: 'Missing required parameter: query' },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (JUPITER_API_KEY) {
      headers['x-api-key'] = JUPITER_API_KEY
    }

    const url = new URL(`${JUPITER_TOKENS_V2}/search`)
    url.searchParams.set('query', query)

    const response = await fetch(url.toString(), { headers })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Jupiter token search failed' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching Jupiter tokens:', error)
    return NextResponse.json(
      {
        error: 'Failed to search tokens',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
