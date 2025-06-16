import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { FetchMethod } from '@/utils/api'
import { dedupSolidScore } from '@/utils/redis-dedup'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Use deduplication to prevent concurrent requests for the same solid score
    const response = await dedupSolidScore(id, async () => {
      return fetchTapestry({
        endpoint: `profiles/${id}/solid-score`,
        method: FetchMethod.GET,
      })
    })

    return NextResponse.json(response, {
      headers: {
        // Cache for 5 minutes since solid scores don't change frequently
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    console.error('[SOLID SCORE ERROR]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
