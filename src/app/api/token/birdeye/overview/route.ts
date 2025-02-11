import { NextResponse } from 'next/server'

const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY
const CACHE_DURATION = 5 // Cache duration in seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { error: 'Token address is required' },
      { status: 400 }
    )
  }

  if (!BIRDEYE_API_KEY) {
    return NextResponse.json(
      {
        error:
          'Birdeye API key is not configured. Please set NEXT_PUBLIC_BIRDEYE_API_KEY in your environment variables.',
      },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${address}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
        },
        next: {
          revalidate: CACHE_DURATION,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Birdeye API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        address,
      })
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Create response with cache headers
    const headers = new Headers()
    headers.set(
      'Cache-Control',
      `s-maxage=${CACHE_DURATION}, stale-while-revalidate`
    )

    return NextResponse.json(data, {
      headers,
      status: 200,
    })
  } catch (error) {
    console.error('Error fetching token overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token overview' },
      { status: 500 }
    )
  }
}
