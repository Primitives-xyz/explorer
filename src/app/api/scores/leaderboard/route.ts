import { scoreManager } from '@/services/scoring/score-manager'
import { ScoringCategory } from '@/services/scoring/scoring-config'
import redis from '@/utils/redis'
import { NextRequest, NextResponse } from 'next/server'

// ISO 8601 week number calculation - must match ScoreManager implementation
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

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
      return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 })
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

    // Get total count from Redis
    const getCurrentTimeKey = (tf: 'daily' | 'weekly' | 'monthly'): string => {
      const now = new Date()
      switch (tf) {
        case 'daily':
          return now.toISOString().split('T')[0]
        case 'weekly':
          return `${now.getFullYear()}-${getWeekNumber(now)}`
        case 'monthly':
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
            2,
            '0'
          )}`
      }
    }

    const key = category
      ? `scores:category:${category}`
      : timeframe === 'lifetime'
      ? 'scores:lifetime'
      : `scores:${timeframe}:${getCurrentTimeKey(
          timeframe as 'daily' | 'weekly' | 'monthly'
        )}`

    const totalCount = await redis.zcard(key)

    // Enrich with profile data (in a real app, you'd fetch from your profiles API)
    // For now, we'll just return the basic data
    const enrichedLeaderboard = leaderboard.map((entry) => ({
      ...entry,
      username: `user_${entry.userId}`, // Placeholder
      profileImage: null, // Placeholder
    }))

    return NextResponse.json(
      {
        leaderboard: enrichedLeaderboard,
        timeframe,
        category,
        limit,
        offset,
        total: totalCount || 0,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60', // Cache for 30 seconds
        },
      }
    )
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
