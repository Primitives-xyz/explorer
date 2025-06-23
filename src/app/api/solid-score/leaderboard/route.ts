import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { ISolidScoreLeaderboardResponse } from '@/components/tapestry/models/solid.score.models'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

interface PaginatedLeaderboardResponse {
  data: ISolidScoreLeaderboardResponse[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const response = await fetchTapestry<ISolidScoreLeaderboardResponse[]>({
      endpoint: 'profiles/solid-score/leaderboard',
      method: FetchMethod.GET,
      queryParams: {
        page,
        pageSize,
      },
    })

    const data = response || []

    // Pour l'instant, on simule une pagination
    // En production, l'API Tapestry devrait retourner les métadonnées de pagination
    const totalCount =
      data.length === pageSize
        ? page * pageSize + 10
        : page * pageSize - pageSize + data.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const hasMore = page < totalPages

    const paginatedResponse: PaginatedLeaderboardResponse = {
      data,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasMore,
      },
    }

    return NextResponse.json(paginatedResponse)
  } catch (err) {
    console.error('[SOLID SCORE LEADERBOARD ERROR]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
