import { NextRequest } from 'next/server'

// --- Types ---
type TradeLogData = {
  walletAddress: string
  tradeType: 'buy' | 'sell' | 'swap'
  inputMint: string
  outputMint: string
  inputAmount: number
  outputAmount: number
  inputValueSOL: number
  outputValueSOL: number
  inputValueUSD?: number
  outputValueUSD?: number
  solPrice?: number
  timestamp: number
}

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

const BASE_TOKENS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'So11111111111111111111111111111111111111112', // SOL
]

function calculateRealizedPnL(trades: TradeLogData[]): number {
  let realizedPnLUSD = 0
  let positions: Record<string, { quantity: number; costUSD: number }> = {}
  trades.sort((a, b) => a.timestamp - b.timestamp)
  for (const trade of trades) {
    if (trade.tradeType === 'buy' && BASE_TOKENS.includes(trade.inputMint)) {
      const mint = trade.outputMint
      if (!positions[mint]) positions[mint] = { quantity: 0, costUSD: 0 }
      positions[mint].quantity += trade.outputAmount
      positions[mint].costUSD += trade.inputValueUSD || 0
    } else if (
      trade.tradeType === 'sell' &&
      BASE_TOKENS.includes(trade.outputMint)
    ) {
      const mint = trade.inputMint
      const pos = positions[mint]
      if (pos && pos.quantity > 0) {
        const sellQty = Math.min(pos.quantity, trade.inputAmount)
        const costBasis = pos.costUSD * (sellQty / pos.quantity)
        const proceeds = trade.outputValueUSD || 0
        realizedPnLUSD += proceeds - costBasis
        pos.quantity -= sellQty
        pos.costUSD -= costBasis
      }
    }
    // Swaps are ignored for realized PnL
  }
  return realizedPnLUSD
}

function calculateWinRateAndBestTrade(trades: TradeLogData[]): {
  winRate: number
  bestTrade: { profit: number; token: string }
} {
  let profitable = 0
  let closed = 0
  let bestProfit = -Infinity
  let bestToken = ''

  for (const trade of trades) {
    // Only consider closed positions (sells)
    if (trade.tradeType === 'sell') {
      closed++
      const profit = (trade.outputValueUSD || 0) - (trade.inputValueUSD || 0)
      if (profit > 0) profitable++
      if (profit > bestProfit) {
        bestProfit = profit
        bestToken = trade.inputMint // token being sold
      }
    }
  }
  return {
    winRate: closed > 0 ? (profitable / closed) * 100 : 0,
    bestTrade: {
      profit: isFinite(bestProfit) ? bestProfit : 0,
      token: bestToken || '---',
    },
  }
}

export async function GET(req: NextRequest) {
  console.log('Fetching leaderboard')
  // Serve from cache if fresh
  if (
    cachedLeaderboard &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    return new Response(JSON.stringify({ leaderboard: cachedLeaderboard }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

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

  // Calculate realized PnL, win rate, and best trade for each wallet
  const leaderboard: LeaderboardEntry[] = Object.entries(tradesByWallet).map(
    ([walletAddress, walletTrades]) => {
      const realizedPnLUSD = calculateRealizedPnL(walletTrades)
      const tradeCount = walletTrades.length
      const { winRate, bestTrade } = calculateWinRateAndBestTrade(walletTrades)
      return {
        walletAddress,
        realizedPnLUSD,
        tradeCount,
        winRate,
        bestTrade,
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
