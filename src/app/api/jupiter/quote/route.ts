import { JUPITER_SWAP_API } from '@/utils/constants'
import { NextRequest, NextResponse } from 'next/server'

const JUPITER_API_KEY = process.env.JUPITER_API_KEY || ''

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 1000 // 1 second
const MAX_REQUESTS_PER_WINDOW = 2 // Maximum 2 requests per second
const requestTimestamps: number[] = []

function isRateLimited(): boolean {
  const now = Date.now()
  // Remove timestamps older than the window
  while (
    requestTimestamps.length > 0 &&
    requestTimestamps[0] < now - RATE_LIMIT_WINDOW
  ) {
    requestTimestamps.shift()
  }
  return requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW
}

// Cache structure
interface QuoteCache {
  data: any
  timestamp: number
}
const quoteCache: Record<string, QuoteCache> = {}
const CACHE_DURATION = 10000 // 10 seconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const inputMint = searchParams.get('inputMint')
    const outputMint = searchParams.get('outputMint')
    const amount = searchParams.get('amount')
    const slippageBps = searchParams.get('slippageBps')

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create cache key
    const cacheKey = `${inputMint}-${outputMint}-${amount}`
    const now = Date.now()

    // Check cache first
    const cached = quoteCache[cacheKey]
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    // Check rate limit
    if (isRateLimited()) {
      // If rate limited but we have a stale cache, return it
      if (cached) {
        return NextResponse.json(cached.data)
      }
      return NextResponse.json(
        {
          error: 'Too many requests',
          details: 'Please try again in a few seconds',
        },
        { status: 429 }
      )
    }

    // Add timestamp for rate limiting
    requestTimestamps.push(now)

    const url = `${JUPITER_SWAP_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${
      slippageBps || 50
    }`

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (JUPITER_API_KEY) {
      headers['x-api-key'] = JUPITER_API_KEY
    }

    const response = await fetch(url, { headers })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Jupiter API error', details: data },
        { status: response.status }
      )
    }

    // Cache successful response
    quoteCache[cacheKey] = {
      data,
      timestamp: now,
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Jupiter quote:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch quote',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
