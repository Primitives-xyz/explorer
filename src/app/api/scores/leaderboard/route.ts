import { scoreManager } from '@/services/scoring/score-manager'
import { ScoringCategory } from '@/services/scoring/scoring-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || 'lifetime'
    const category = searchParams.get('category') as ScoringCategory | null
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate parameters
    const validTimeframes = ['lifetime', 'daily', 'weekly', 'monthly'] as const
    if (!validTimeframes.includes(timeframe as any)) {
      return NextResponse.json(
        { error: 'Invalid timeframe' },
        { status: 400 }
      )
    }

    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 1000' },
        { status: 400 }
      )
    }

    // Get leaderboard
    const leaderboard = await scoreManager.getLeaderboard(
      timeframe as 'lifetime' | 'daily' | 'weekly' | 'monthly',
      limit,
      offset,
      category || undefined
    )

    // Enrich with profile data (in a real app, you'd fetch from your profiles API)
    // For now, we'll just return the basic data
    const enrichedLeaderboard = leaderboard.map(entry => ({
      ...entry,
      username: `user_${entry.userId}`, // Placeholder
      profileImage: null // Placeholder
    }))

    return NextResponse.json({
      leaderboard: enrichedLeaderboard,
      timeframe,
      category,
      limit,
      offset,
      total: enrichedLeaderboard.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60', // Cache for 30 seconds
      }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'