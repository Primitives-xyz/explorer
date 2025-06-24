import { NextRequest } from 'next/server'

// --- Types ---
type TradeLogData = {
  transactionSignature: string
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

// Clear cache on startup to force fresh calculation
cachedLeaderboard = null
cacheTimestamp = null

const BASE_TOKENS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'So11111111111111111111111111111111111111112', // SOL
]

function calculateRealizedPnL(trades: TradeLogData[]): number {
  console.log('🔍 calculateRealizedPnL called with', trades.length, 'trades')
  let realizedPnLUSD = 0

  // FIFO buy history per token
  const tokenBuyHistory = new Map<
    string,
    Array<{
      amount: number
      costUSD: number
      timestamp: number
    }>
  >()

  // Deduplicate transactions by signature to prevent duplicate processing
  const uniqueTrades = trades.filter(
    (tx, index, arr) =>
      arr.findIndex(
        (t) => t.transactionSignature === tx.transactionSignature
      ) === index
  )
  console.log(
    `🔍 Deduplicated: ${trades.length} → ${uniqueTrades.length} trades`
  )

  // Sort trades by timestamp for proper FIFO processing
  const sortedTrades = uniqueTrades.sort((a, b) => a.timestamp - b.timestamp)
  console.log('📊 Processing', sortedTrades.length, 'sorted trades')
  for (const trade of sortedTrades) {
    if (trade.tradeType === 'buy' && BASE_TOKENS.includes(trade.inputMint)) {
      const mint = trade.outputMint
      if (!tokenBuyHistory.has(mint)) {
        tokenBuyHistory.set(mint, [])
      }

      const costUSD = trade.inputValueUSD || 0
      const amount = trade.outputAmount

      tokenBuyHistory.get(mint)!.push({
        amount,
        costUSD,
        timestamp: trade.timestamp,
      })
    } else if (
      trade.tradeType === 'sell' &&
      BASE_TOKENS.includes(trade.outputMint)
    ) {
      const mint = trade.inputMint
      const buyHistory = tokenBuyHistory.get(mint) || []

      if (buyHistory.length === 0) {
        // No buy history for this token, skip this sell
        continue
      }

      let remainingToSell = trade.inputAmount
      let totalCostBasis = 0
      const sellRevenueUSD = trade.outputValueUSD || 0

      // Process sells using FIFO (consume oldest buys first)
      for (let i = 0; i < buyHistory.length && remainingToSell > 0; i++) {
        const buy = buyHistory[i]
        const amountToUse = Math.min(remainingToSell, buy.amount)

        // Calculate proportional cost basis for this portion
        totalCostBasis += (amountToUse / buy.amount) * buy.costUSD

        // Update buy history (this modifies the original array)
        const originalAmount = buy.amount
        buy.amount -= amountToUse
        buy.costUSD = (buy.amount / originalAmount) * buy.costUSD

        remainingToSell -= amountToUse
      }

      // Remove fully consumed buys
      tokenBuyHistory.set(
        mint,
        buyHistory.filter((buy) => buy.amount > 0)
      )

      // Calculate PnL only for the amount we could match with buys
      const actualSoldAmount = trade.inputAmount - remainingToSell
      if (actualSoldAmount > 0) {
        // Proportional revenue for the amount we actually processed
        const proportionalRevenue =
          (actualSoldAmount / trade.inputAmount) * sellRevenueUSD
        realizedPnLUSD += proportionalRevenue - totalCostBasis
      }
    }
    // Swaps are ignored for realized PnL
  }

  console.log('🏆 Leaderboard PnL calculation result:', realizedPnLUSD)
  return realizedPnLUSD
}

function calculateWinRateAndBestTrade(trades: TradeLogData[]): {
  winRate: number
  bestTrade: { profit: number; token: string }
} {
  // We need to implement position calculation for the leaderboard too
  // For now, let's use a simplified version that deduplicates and calculates properly
  const uniqueTrades = trades.filter(
    (tx, index, arr) =>
      arr.findIndex(
        (t) => t.transactionSignature === tx.transactionSignature
      ) === index
  )

  // Track profit per token using FIFO
  const tokenProfits = new Map<string, number>()
  const tokenBuyHistory = new Map<
    string,
    Array<{ amount: number; costUSD: number; timestamp: number }>
  >()

  const BASE_TOKENS = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'So11111111111111111111111111111111111111112', // SOL
  ]

  // Sort by timestamp for FIFO
  const sortedTrades = uniqueTrades.sort((a, b) => a.timestamp - b.timestamp)

  for (const trade of sortedTrades) {
    if (trade.tradeType === 'buy' && BASE_TOKENS.includes(trade.inputMint)) {
      const mint = trade.outputMint
      if (BASE_TOKENS.includes(mint)) continue

      if (!tokenBuyHistory.has(mint)) {
        tokenBuyHistory.set(mint, [])
      }
      tokenBuyHistory.get(mint)!.push({
        amount: trade.outputAmount,
        costUSD: trade.inputValueUSD || 0,
        timestamp: trade.timestamp,
      })
    } else if (
      trade.tradeType === 'sell' &&
      BASE_TOKENS.includes(trade.outputMint)
    ) {
      const mint = trade.inputMint
      if (BASE_TOKENS.includes(mint)) continue

      const buyHistory = tokenBuyHistory.get(mint) || []
      if (buyHistory.length === 0) continue

      let remainingToSell = trade.inputAmount
      let totalCostBasis = 0
      const sellRevenueUSD = trade.outputValueUSD || 0

      // Process sells using FIFO
      for (let i = 0; i < buyHistory.length && remainingToSell > 0; i++) {
        const buy = buyHistory[i]
        const amountToUse = Math.min(remainingToSell, buy.amount)
        totalCostBasis += (amountToUse / buy.amount) * buy.costUSD

        const originalAmount = buy.amount
        buy.amount -= amountToUse
        buy.costUSD = (buy.amount / originalAmount) * buy.costUSD
        remainingToSell -= amountToUse
      }

      // Remove fully consumed buys
      tokenBuyHistory.set(
        mint,
        buyHistory.filter((buy) => buy.amount > 0)
      )

      // Calculate profit for this sell
      const actualSoldAmount = trade.inputAmount - remainingToSell
      if (actualSoldAmount > 0) {
        const proportionalRevenue =
          (actualSoldAmount / trade.inputAmount) * sellRevenueUSD
        const profit = proportionalRevenue - totalCostBasis
        tokenProfits.set(mint, (tokenProfits.get(mint) || 0) + profit)
      }
    }
  }

  // Calculate win rate and best trade from token profits
  const completedTokens = Array.from(tokenProfits.entries())
  const profitableTokens = completedTokens.filter(([_, profit]) => profit > 0)

  let bestProfit = -Infinity
  let bestToken = ''
  for (const [token, profit] of completedTokens) {
    if (profit > bestProfit) {
      bestProfit = profit
      bestToken = token
    }
  }

  return {
    winRate:
      completedTokens.length > 0
        ? (profitableTokens.length / completedTokens.length) * 100
        : 0,
    bestTrade: {
      profit: isFinite(bestProfit) && bestProfit > -Infinity ? bestProfit : 0,
      token: bestToken || '---',
    },
  }
}

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
