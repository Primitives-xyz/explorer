import {
  calculatePnLMetrics,
  type TradeLogData,
} from '@/utils/pnl-calculations'
import { NextRequest } from 'next/server'

type LeaderboardEntry = {
  walletAddress: string
  realizedPnLUSD: number
  tradeCount: number
  winRate: number // as a percentage, e.g., 67.5
  bestTrade: {
    profit: number
    token: string
  }
}

// --- In-memory cache ---
let cachedLeaderboard: LeaderboardEntry[] | null = null
let cacheKey: string | null = null // Cache key based on time parameters

// Clear cache on startup to force fresh calculation
cachedLeaderboard = null
cacheKey = null

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const since = searchParams.get('since')
  const until = searchParams.get('until')

  // Create cache key from parameters
  const currentCacheKey = `${since || 'all'}-${until || 'now'}`

  // Serve from cache if we have data for the same parameters
  if (cachedLeaderboard && cacheKey === currentCacheKey) {
    return new Response(JSON.stringify({ leaderboard: cachedLeaderboard }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Build URL with time range parameters
  const baseUrl = `${
    process.env.TAPESTRY_URL || 'https://tapestry.fly.dev'
  }/trades/all-trades`

  const params = new URLSearchParams({
    limit: '10000', // Set a high limit to get all trades for the period
  })

  if (since) {
    params.set('since', since)
  }
  if (until) {
    params.set('until', until)
  }

  const url = `${baseUrl}?${params.toString()}`

  console.log(`Fetching leaderboard data with params:`, { since, until })

  const response = await fetch(url)
  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch trades from Tapestry' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
  const { data: trades }: { data: TradeLogData[] } = await response.json()

  console.log(`Fetched ${trades.length} trades for leaderboard`)

  // Group by wallet
  const tradesByWallet: Record<string, TradeLogData[]> = {}
  for (const trade of trades) {
    if (!tradesByWallet[trade.walletAddress])
      tradesByWallet[trade.walletAddress] = []
    tradesByWallet[trade.walletAddress].push(trade)
  }

  // Calculate realized PnL, win rate, and best trade for each wallet using shared utility
  const leaderboard: LeaderboardEntry[] = Object.entries(tradesByWallet).map(
    ([walletAddress, walletTrades]) => {
      // Use the shared utility for consistent calculations
      const pnlResult = calculatePnLMetrics(walletTrades, {
        includePositions: false, // Don't need positions for leaderboard
        trackBestTrade: true, // Track best individual trade
      })

      return {
        walletAddress,
        realizedPnLUSD: pnlResult.realizedPnLUSD,
        tradeCount: pnlResult.tradeCount,
        winRate: pnlResult.winRate,
        bestTrade: pnlResult.bestTrade,
      }
    }
  )

  // Sort and take top 10
  leaderboard.sort((a, b) => b.realizedPnLUSD - a.realizedPnLUSD)
  const top10 = leaderboard.slice(0, 10)

  // Cache result for these parameters
  cachedLeaderboard = top10
  cacheKey = currentCacheKey

  return new Response(
    JSON.stringify({
      leaderboard: top10,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
