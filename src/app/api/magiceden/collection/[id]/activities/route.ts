import { MagicEdenActivitiesResponse } from '@/types/nft/magic-eden/api'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Collection symbol is required' },
        { status: 400 }
      )
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Define valid activity types
    const validTypes = ['all', 'buyNow', 'list', 'delist', 'bid', 'cancelBid']
    let type = searchParams.get('type') || 'all'

    // Validate type parameter
    if (!validTypes.includes(type)) {
      type = 'all'
    }

    const options = { method: 'GET', headers: { accept: 'application/json' } }

    // Construct the API URL with query parameters
    const apiUrl = new URL(
      `https://api-mainnet.magiceden.dev/v2/collections/${id}/activities`
    )
    if (type !== 'all') {
      apiUrl.searchParams.append('type', type)
    }
    apiUrl.searchParams.append('limit', limit.toString())
    apiUrl.searchParams.append('offset', offset.toString())

    const response = await fetch(apiUrl.toString(), options)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch collection activities' },
        { status: response.status }
      )
    }

    const data = (await response.json()) as MagicEdenActivitiesResponse

    // Transform the data to include SOL prices instead of lamports
    const transformedActivities = data.activities.map((activity) => ({
      ...activity,
      price: activity.price
        ? Math.round((activity.price / LAMPORTS_PER_SOL) * 1000) / 1000
        : undefined,
      // Convert blockTime to ISO date string for easier client-side handling
      date: activity.blockTime
        ? new Date(activity.blockTime * 1000).toISOString()
        : undefined,
    }))

    return NextResponse.json({
      activities: transformedActivities,
      pagination: {
        limit,
        offset,
        total: transformedActivities.length,
        hasMore: transformedActivities.length === limit,
      },
    })
  } catch (error: any) {
    console.error('Error fetching collection activities:', error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to fetch collection activities'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
