import { ITrendingTokenWidthHolders } from '@/components/discover/models/trending-tokens.models'
import { FetchMethod, fetchWrapper } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextResponse } from 'next/server'

const BIRDEYE_ENDPOINT = 'https://public-api.birdeye.so/defi/token_trending'

export async function GET() {
  try {
    const birdeyeData = await fetchWrapper<{
      data: { tokens: ITrendingTokenWidthHolders[] }
    }>({
      method: FetchMethod.GET,
      endpoint: BIRDEYE_ENDPOINT,
      queryParams: {
        sort_by: 'volume24hUSD',
        sort_type: 'desc',
        offset: 0,
        limit: 20,
      },
      headers: {
        'x-chain': 'solana',
        'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY!,
      },
      toBackend: false,
    })

    const tokens = birdeyeData?.data?.tokens ?? []

    const tokensWithHolders = await Promise.all(
      tokens.map(async (token: ITrendingTokenWidthHolders) => {
        try {
          const holdersResponse = await fetchTapestryServer({
            endpoint: `profiles/token-owners/${token.address}?page=1&pageSize=3`,
            method: FetchMethod.GET,
          })

          return {
            ...token,
            holders: {
              profiles: holdersResponse.profiles || [],
              totalAmount: holdersResponse.profiles?.length || 0,
            },
          }
        } catch (e) {
          console.error(`Error fetching holders for token ${token.address}`, e)
          return {
            ...token,
            holders: {
              profiles: [],
              totalAmount: 0,
            },
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        updateUnixTime: Date.now(),
        updateTime: new Date().toISOString(),
        tokens: tokensWithHolders,
        total: tokensWithHolders.length,
      },
    })
  } catch (error: any) {
    console.error('[Trending With Holders API Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}
