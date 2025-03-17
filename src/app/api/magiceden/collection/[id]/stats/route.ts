import {
  CollectionStats,
  MagicEdenActivitiesResponse,
  MagicEdenAttributesResponse,
  MagicEdenCollectionStatsResponse,
  MagicEdenHolderStatsResponse,
} from '@/types/nft/magic-eden/api'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

// Route context type
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
    const includeActivities = searchParams.get('includeActivities') === 'true'
    const activitiesLimit = parseInt(
      searchParams.get('activitiesLimit') || '5',
      10
    )

    const options = { method: 'GET', headers: { accept: 'application/json' } }

    // Define all API endpoints
    const endpoints = {
      stats: `https://api-mainnet.magiceden.us/rpc/getCollectionEscrowStats/${id}?status=all&edge_cache=true&enableFloorWithFee=true`,
      holders: `https://api-mainnet.magiceden.dev/v2/collections/${id}/holder_stats`,
      attributes: `https://api-mainnet.magiceden.dev/v2/collections/${id}/attributes`,
      activities: `https://api-mainnet.magiceden.dev/v2/collections/${id}/activities?limit=${activitiesLimit}`,
    }

    // Fetch all data in parallel
    const [statsResponse, holdersResponse, attributesResponse] =
      await Promise.all([
        fetch(endpoints.stats, options),
        fetch(endpoints.holders, options),
        fetch(endpoints.attributes, options),
      ])

    // Conditionally fetch activities if requested
    let activitiesResponse = null
    if (includeActivities) {
      activitiesResponse = await fetch(endpoints.activities, options)
    }

    // Parse responses
    const statsData = statsResponse.ok
      ? ((await statsResponse.json()) as MagicEdenCollectionStatsResponse)
      : null
    const holdersData = holdersResponse.ok
      ? ((await holdersResponse.json()) as MagicEdenHolderStatsResponse)
      : null
    const attributesData = attributesResponse.ok
      ? ((await attributesResponse.json()) as MagicEdenAttributesResponse)
      : null

    // Parse activities if requested
    let activitiesData = null
    if (includeActivities && activitiesResponse && activitiesResponse.ok) {
      activitiesData =
        (await activitiesResponse.json()) as MagicEdenActivitiesResponse
    }
    console.dir(
      {
        statsData,
        holdersData,
        attributesData,
        activitiesData,
      },
      {
        depth: null,
      }
    )

    // Check if we have at least the basic stats data
    if (!statsData) {
      return NextResponse.json(
        { error: 'Failed to fetch collection stats' },
        { status: 404 }
      )
    }

    // Calculate avgPrice24hr if volume and transactions are available
    const avgPrice24hr =
      statsData.results.txns24hr > 0
        ? Math.round(
            (statsData.results.volume24hr /
              statsData.results.txns24hr /
              LAMPORTS_PER_SOL) *
              1000
          ) / 1000
        : 0

    // Prepare the response object with all available data
    const response: CollectionStats = {
      symbol: id,
      floorPrice:
        Math.round((statsData.results.floorPrice / LAMPORTS_PER_SOL) * 1000) /
        1000,
      listedCount: statsData.results.listedCount,
      volume24hr:
        Math.round((statsData.results.volume24hr / LAMPORTS_PER_SOL) * 100) /
        100,
      avgPrice24hr,
      txns24hr: statsData.results.txns24hr,
      volumeAll:
        Math.round((statsData.results.volumeAll / LAMPORTS_PER_SOL) * 100) /
        100,

      // Use holder stats if available, otherwise fallback to defaults
      supply: holdersData?.totalSupply || 0,
      holders: holdersData?.uniqueHolders || 0,
      avgHolding: holdersData?.avgHolding || 0,
    }

    // Add floor price with fee if available
    if (statsData.results.floorPriceWithFee) {
      response.floorPriceWithFee =
        Math.round(
          (statsData.results.floorPriceWithFee / LAMPORTS_PER_SOL) * 1000
        ) / 1000
    }

    // Add attributes data if available
    if (attributesData?.attributes) {
      response.attributes = attributesData.attributes
    }

    // Add top holders if available
    if (holdersData?.topHolders) {
      response.topHolders = holdersData.topHolders
    }

    // Add recent activities if requested and available
    if (activitiesData?.activities) {
      response.recentActivities = activitiesData.activities.map((activity) => ({
        type: activity.type,
        price: activity.price
          ? Math.round((activity.price / LAMPORTS_PER_SOL) * 1000) / 1000
          : undefined,
        time: activity.blockTime,
      }))
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5',
      },
    })
  } catch (error: any) {
    console.error('Error fetching NFT collection stats:', error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to fetch NFT collection stats'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
