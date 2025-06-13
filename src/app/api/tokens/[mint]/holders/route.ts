import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { dedupTokenHolders } from '@/utils/redis-dedup'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ mint: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { mint } = params
    const searchParams = req.nextUrl.searchParams
    const requestorId = searchParams.get('requestorId')
    const page = searchParams.get('page') || '1'
    const pageSize = searchParams.get('pageSize') || '10'

    if (!mint) {
      return NextResponse.json(
        { error: 'Token mint address is required' },
        { status: 400 }
      )
    }

    // Create a cache key that includes pagination params
    const cacheKey = `${mint}:${page}:${pageSize}:${requestorId || 'none'}`

    // Use deduplication to prevent concurrent requests
    const response = await dedupTokenHolders(mint, async () => {
      const result = await fetchTapestryServer({
        endpoint: `profiles/token-owners/${mint}?page=${page}&pageSize=${pageSize}${
          requestorId ? `&requestorId=${requestorId}` : ''
        }`,
        method: FetchMethod.GET,
      })

      // Transform the response to match our expected format
      return {
        profiles: result.profiles || [],
        totalAmount: result.profiles?.length || 0,
      }
    })

    return NextResponse.json(response, {
      headers: {
        // Cache for 2 minutes since holder data changes moderately
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    })
  } catch (error: any) {
    console.error('[Token Holders API Error]:', {
      error: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token holders' },
      { status: 500 }
    )
  }
}
