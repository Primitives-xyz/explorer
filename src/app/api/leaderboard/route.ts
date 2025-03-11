import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

// Add cache configuration
interface LeaderboardEntry {
  position: number
  profile: {
    username: string
    image?: string
    bio?: string
    wallet?: {
      id: string
      blockchain: string
    }
  }
  score: number
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  page: number
  pageSize: number
  total: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const timeStart = searchParams.get('timeStart')
    const timeEnd = searchParams.get('timeEnd')
    const timeField = searchParams.get('timeField') || 'createdAt'
    const sortBy = searchParams.get('sortBy') || 'followers' // Default sort by followers count

    // Validate parameters
    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      )
    }

    if (pageSize < 1 || pageSize > 50) {
      return NextResponse.json(
        { error: 'Page size must be between 1 and 50' },
        { status: 400 }
      )
    }

    // Construct the endpoint with query parameters
    let endpoint = `leaderboard?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}`

    if (timeStart) {
      endpoint += `&timeStart=${timeStart}`
      if (timeEnd) {
        endpoint += `&timeEnd=${timeEnd}`
      }
      endpoint += `&timeField=${timeField}`
    }

    const data = await fetchTapestryServer({
      endpoint,
      method: FetchMethod.GET,
    })

    // Transform the response to match our expected format
    const response: LeaderboardResponse = {
      entries: data.entries.map((entry: any, index: number) => ({
        position: (page - 1) * pageSize + index + 1,
        profile: {
          username: entry.profile.username,
          image: entry.profile.image,
          bio: entry.profile.bio,
          wallet: entry.profile.wallet,
        },
        score: entry.score,
      })),
      page,
      pageSize,
      total: data.total || data.entries.length,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', // Cache for 1 minute with 5 minutes stale-while-revalidate
      },
    })
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
