import { scoreManager } from '@/services/scoring/score-manager'
import redis from '@/utils/redis'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ userId: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { userId } = await context.params
  const { searchParams } = new URL(request.url)
  const timeframe = searchParams.get('timeframe') || 'lifetime'

  try {
    const validTimeframes = ['lifetime', 'daily', 'weekly', 'monthly'] as const
    if (!validTimeframes.includes(timeframe as any)) {
      return NextResponse.json(
        { error: 'Invalid timeframe' },
        { status: 400 }
      )
    }

    const scoreData = await scoreManager.getUserScoreData(
      userId, 
      timeframe as 'lifetime' | 'daily' | 'weekly' | 'monthly'
    )

    // Get user percentile
    const percentile = await scoreManager.getUserPercentile(
      userId,
      timeframe as 'lifetime' | 'daily' | 'weekly' | 'monthly'
    )

    return NextResponse.json({
      userId,
      timeframe,
      ...scoreData,
      percentile
    })
  } catch (error) {
    console.error('Error fetching user score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch score' },
      { status: 500 }
    )
  }
}