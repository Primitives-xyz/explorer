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
let cacheTimestamp: number | null = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 1 day

// Clear cache on startup to force fresh calculation
cachedLeaderboard = null
cacheTimestamp = null

export async function GET(req: NextRequest) {
  console.log('🏆 Fetching leaderboard - cache check...')
  // Serve from cache if fresh
  if (
    cachedLeaderboard &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    console.log('📦 Serving from cache')
    return new Response(JSON.stringify({ leaderboard: cachedLeaderboard }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.log('🔄 Cache miss - fetching fresh data')

  // Fetch all trades from Tapestry
  const url = `${
    process.env.TAPESTRY_URL || 'https://tapestry.fly.dev'
  }/trades/all-trades`
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
      console.log(
        `🏆 Calculating PnL for wallet: ${walletAddress.substring(0, 8)} with ${
          walletTrades.length
        } trades`
      )

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

  // Cache result
  cachedLeaderboard = top10
  cacheTimestamp = Date.now()

  return new Response(JSON.stringify({ leaderboard: top10 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
