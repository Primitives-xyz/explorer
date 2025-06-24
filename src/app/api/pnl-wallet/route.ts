import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

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

type TokenPosition = {
  mint: string
  symbol: string
  totalBought: number // total tokens bought
  totalSold: number // total tokens sold
  remainingTokens: number // bought - sold
  totalCostUSD: number // total USD spent buying
  totalRevenueUSD: number // total USD received selling
  realizedPnLUSD: number // revenue - cost for sold portion
  isOpen: boolean // has remaining tokens
  transactions: TradeLogData[]
  averageBuyPriceUSD: number // cost per token bought
  averageSellPriceUSD: number // revenue per token sold
  positionId: string // unique identifier for this position
  isIncomplete: boolean // missing USD values
  incompleteReason?: string // why the position is incomplete
  soldAmount?: number // for closed positions, amount sold
  soldPrice?: number // for closed positions, price per token sold
  costBasis?: number // for closed positions, cost basis of sold tokens
}

type WalletPnLStats = {
  walletAddress: string
  realizedPnLUSD: number
  tradeCount: number
  winRate: number // as a percentage, e.g., 67.5
  bestTrade: {
    profit: number
    token: string
  }
  dateRange: {
    since?: number
    until?: number
  }
  positions?: TokenPosition[] // Add positions for inventory modal
}

const BASE_TOKENS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'So11111111111111111111111111111111111111112', // SOL
]

function calculateRealizedPnL(trades: TradeLogData[]): number {
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

  // Sort trades by timestamp for proper FIFO processing
  const sortedTrades = uniqueTrades.sort((a, b) => a.timestamp - b.timestamp)

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
  return realizedPnLUSD
}

function calculatePositions(transactions: TradeLogData[]): TokenPosition[] {
  const positions: TokenPosition[] = []
  const tokenBuyHistory = new Map<
    string,
    Array<{
      amount: number
      costUSD: number
      pricePerToken: number
      timestamp: number
      transaction: TradeLogData
    }>
  >()

  // Deduplicate transactions by signature to prevent duplicate positions
  const uniqueTransactions = transactions.filter(
    (tx, index, arr) =>
      arr.findIndex(
        (t) => t.transactionSignature === tx.transactionSignature
      ) === index
  )

  // First pass: collect all buy transactions and organize by token
  const buyTransactions: TradeLogData[] = []
  const sellTransactions: TradeLogData[] = []

  uniqueTransactions.forEach((tx) => {
    if (tx.tradeType === 'swap') return // Skip swaps

    // Only process buys where input is a base token (spending SOL/USDC to buy tokens)
    if (tx.tradeType === 'buy' && BASE_TOKENS.includes(tx.inputMint)) {
      const tokenMint = tx.outputMint

      // Skip if we're buying SOL/USDC (not relevant for token positions)
      if (BASE_TOKENS.includes(tokenMint)) return

      buyTransactions.push(tx)

      if (!tokenBuyHistory.has(tokenMint)) {
        tokenBuyHistory.set(tokenMint, [])
      }

      const costUSD = tx.inputValueUSD || 0
      const amount = tx.outputAmount
      const pricePerToken = amount > 0 && costUSD > 0 ? costUSD / amount : 0

      tokenBuyHistory.get(tokenMint)!.push({
        amount,
        costUSD,
        pricePerToken,
        timestamp: tx.timestamp,
        transaction: tx,
      })
    }
  })

  // Second pass: process sell transactions and create closed positions
  uniqueTransactions.forEach((tx) => {
    // Only process sells where output is a base token (selling tokens for SOL/USDC)
    if (tx.tradeType !== 'sell' || !BASE_TOKENS.includes(tx.outputMint)) return

    const tokenMint = tx.inputMint
    // Skip if we're selling SOL/USDC (not relevant for token positions)
    if (BASE_TOKENS.includes(tokenMint)) return

    sellTransactions.push(tx)

    const sellAmount = tx.inputAmount
    const sellRevenueUSD = tx.outputValueUSD || 0
    const sellPricePerToken =
      sellAmount > 0 && sellRevenueUSD > 0 ? sellRevenueUSD / sellAmount : 0

    // Check if we have complete data
    const isIncomplete = !tx.inputValueUSD || !tx.outputValueUSD
    let incompleteReason = ''
    if (!tx.inputValueUSD && !tx.outputValueUSD) {
      incompleteReason = 'Missing input and output USD values'
    } else if (!tx.inputValueUSD) {
      incompleteReason = 'Missing input USD value'
    } else if (!tx.outputValueUSD) {
      incompleteReason = 'Missing output USD value'
    }

    // Calculate cost basis using FIFO (First In, First Out)
    const buyHistory = tokenBuyHistory.get(tokenMint) || []
    let remainingToSell = sellAmount
    let totalCostBasis = 0
    let averageBuyPrice = 0

    // Sort buy history by timestamp (FIFO)
    const sortedBuyHistory = [...buyHistory].sort(
      (a, b) => a.timestamp - b.timestamp
    )

    for (const buy of sortedBuyHistory) {
      if (remainingToSell <= 0) break

      const amountToUse = Math.min(remainingToSell, buy.amount)
      totalCostBasis += (amountToUse / buy.amount) * buy.costUSD
      remainingToSell -= amountToUse
    }

    averageBuyPrice =
      sellAmount > 0 && totalCostBasis > 0 ? totalCostBasis / sellAmount : 0

    // Create closed position for this sell
    const closedPosition: TokenPosition = {
      mint: tokenMint,
      symbol: tokenMint.substring(0, 8),
      totalBought: sellAmount, // For closed positions, this represents the amount that was sold
      totalSold: sellAmount,
      remainingTokens: 0,
      totalCostUSD: totalCostBasis,
      totalRevenueUSD: sellRevenueUSD,
      realizedPnLUSD: sellRevenueUSD - totalCostBasis,
      isOpen: false,
      transactions: [tx],
      averageBuyPriceUSD: averageBuyPrice,
      averageSellPriceUSD: sellPricePerToken,
      positionId: tx.transactionSignature,
      isIncomplete,
      incompleteReason: incompleteReason || undefined,
      soldAmount: sellAmount,
      soldPrice: sellPricePerToken,
      costBasis: totalCostBasis,
    }

    positions.push(closedPosition)

    // Update buy history to reflect consumed tokens (FIFO)
    let remaining = sellAmount
    tokenBuyHistory.set(
      tokenMint,
      sortedBuyHistory
        .map((buy) => {
          if (remaining <= 0) return buy

          if (buy.amount <= remaining) {
            remaining -= buy.amount
            return { ...buy, amount: 0 }
          } else {
            const newAmount = buy.amount - remaining
            const newCostUSD = (newAmount / buy.amount) * buy.costUSD
            remaining = 0
            return { ...buy, amount: newAmount, costUSD: newCostUSD }
          }
        })
        .filter((buy) => buy.amount > 0)
    )
  })

  // Third pass: create open positions for remaining tokens
  tokenBuyHistory.forEach((buyHistory, tokenMint) => {
    const remainingBuys = buyHistory.filter((buy) => buy.amount > 0)
    if (remainingBuys.length === 0) return

    const totalRemainingTokens = remainingBuys.reduce(
      (sum, buy) => sum + buy.amount,
      0
    )
    const totalRemainingCost = remainingBuys.reduce(
      (sum, buy) => sum + buy.costUSD,
      0
    )
    const averageBuyPrice =
      totalRemainingTokens > 0 ? totalRemainingCost / totalRemainingTokens : 0

    // Check if any buy transactions are incomplete
    const incompleteBuys = remainingBuys.filter(
      (buy) => !buy.transaction.inputValueUSD || !buy.transaction.outputValueUSD
    )
    const isIncomplete = incompleteBuys.length > 0
    const incompleteReason = isIncomplete
      ? `${incompleteBuys.length} buy transaction(s) missing USD values`
      : undefined

    const openPosition: TokenPosition = {
      mint: tokenMint,
      symbol: tokenMint.substring(0, 8),
      totalBought: totalRemainingTokens,
      totalSold: 0,
      remainingTokens: totalRemainingTokens,
      totalCostUSD: totalRemainingCost,
      totalRevenueUSD: 0,
      realizedPnLUSD: 0,
      isOpen: true,
      transactions: remainingBuys.map((buy) => buy.transaction),
      averageBuyPriceUSD: averageBuyPrice,
      averageSellPriceUSD: 0,
      positionId: `${tokenMint}-open`,
      isIncomplete,
      incompleteReason,
    }

    positions.push(openPosition)
  })

  return positions
}

function calculateWinRateAndBestTrade(trades: TradeLogData[]): {
  winRate: number
  bestTrade: { profit: number; token: string }
} {
  // Calculate positions to get proper win rate and best trade
  const positions = calculatePositions(trades)

  // Only consider closed positions for win rate
  const closedPositions = positions.filter((p) => !p.isOpen && !p.isIncomplete)
  const profitablePositions = closedPositions.filter(
    (p) => p.realizedPnLUSD > 0
  )

  // Find best trade among all positions (including incomplete ones for token identification)
  let bestProfit = -Infinity
  let bestToken = ''

  for (const position of positions.filter((p) => !p.isOpen)) {
    if (position.realizedPnLUSD > bestProfit) {
      bestProfit = position.realizedPnLUSD
      bestToken = position.mint
    }
  }

  return {
    winRate:
      closedPositions.length > 0
        ? (profitablePositions.length / closedPositions.length) * 100
        : 0,
    bestTrade: {
      profit: isFinite(bestProfit) && bestProfit > -Infinity ? bestProfit : 0,
      token: bestToken || '---',
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const since = searchParams.get('since')
    const until = searchParams.get('until')
    const limit = searchParams.get('limit') || '1000' // Higher default for PnL calculations
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const includePositions = searchParams.get('includePositions') === 'true' // For inventory modal

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    console.log('💰 Calculating PnL for wallet:', {
      walletAddress: walletAddress.substring(0, 8),
      since: since ? new Date(parseInt(since) * 1000).toISOString() : 'none',
      until: until ? new Date(parseInt(until) * 1000).toISOString() : 'none',
      limit,
    })

    // Build query string
    const params = new URLSearchParams({
      walletAddress,
      limit,
      sortOrder,
    })

    if (since) params.append('since', since)
    if (until) params.append('until', until)

    // Fetch transaction history from Tapestry
    const response = await fetchTapestryServer({
      endpoint: `trades/fetch-transaction-history?${params.toString()}`,
      method: FetchMethod.GET,
    })

    if (!response?.data) {
      return NextResponse.json(
        { error: 'Failed to fetch transaction history' },
        { status: 500 }
      )
    }

    const trades: TradeLogData[] = response.data

    console.log('📊 Processing trades for PnL calculation:', {
      walletAddress: walletAddress.substring(0, 8),
      transactionCount: trades.length,
    })

    // Calculate PnL and stats
    const realizedPnLUSD = calculateRealizedPnL(trades)
    const tradeCount = trades.length
    const { winRate, bestTrade } = calculateWinRateAndBestTrade(trades)

    const walletStats: WalletPnLStats = {
      walletAddress,
      realizedPnLUSD,
      tradeCount,
      winRate,
      bestTrade,
      dateRange: {
        since: since ? parseInt(since) : undefined,
        until: until ? parseInt(until) : undefined,
      },
    }

    // Calculate positions if requested (for inventory modal)
    if (includePositions) {
      walletStats.positions = calculatePositions(trades)
    }

    console.log('✅ PnL calculation complete:', {
      walletAddress: walletAddress.substring(0, 8),
      realizedPnLUSD: realizedPnLUSD.toFixed(2),
      tradeCount,
      winRate: winRate.toFixed(1) + '%',
    })

    return NextResponse.json({ stats: walletStats })
  } catch (error: any) {
    console.error('❌ Error calculating wallet PnL:', error)
    return NextResponse.json(
      { error: 'Failed to calculate wallet PnL' },
      { status: 500 }
    )
  }
}
