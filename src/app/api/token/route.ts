import { fetchTokenInfo } from '@/utils/helius/das-api'
import { NextResponse } from 'next/server'

export const revalidate = 10 // Cache for 10 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mint = searchParams.get('mint')

  if (!mint) {
    return NextResponse.json(
      { error: 'Missing mint parameter' },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  try {
    const tokenInfo = await fetchTokenInfo(mint)
    if (!tokenInfo) {
      return NextResponse.json(
        { error: 'Token not found' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    return NextResponse.json(tokenInfo, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    })
  } catch (error) {
    console.error('Error fetching token info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token info' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}
