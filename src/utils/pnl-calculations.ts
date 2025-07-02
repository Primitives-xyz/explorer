// --- Types ---
export type TradeLogData = {
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

export type TokenPosition = {
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

export type PnLCalculationResult = {
  realizedPnLUSD: number
  tradeCount: number
  winRate: number
  bestTrade: {
    profit: number
    token: string
  }
  positions?: TokenPosition[]
}

export const BASE_TOKENS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'So11111111111111111111111111111111111111112', // SOL
]

/**
 * Comprehensive PnL calculation that processes trades once using FIFO accounting
 * and tracks all metrics in a single pass for efficiency
 */
export function calculatePnLMetrics(
  trades: TradeLogData[],
  options: {
    includePositions?: boolean
    trackBestTrade?: boolean
  } = {}
): PnLCalculationResult {
  const { includePositions = false, trackBestTrade = true } = options

  // Deduplicate transactions by signature to prevent duplicate processing
  const uniqueTrades = trades.filter(
    (tx, index, arr) =>
      arr.findIndex(
        (t) => t.transactionSignature === tx.transactionSignature
      ) === index
  )

  // Sort trades by timestamp for proper FIFO processing
  const sortedTrades = uniqueTrades.sort((a, b) => a.timestamp - b.timestamp)

  // FIFO buy history per token
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

  // Metrics we're tracking
  let realizedPnLUSD = 0
  const positions: TokenPosition[] = []
  let bestTradeProfit = -Infinity
  let bestTradeToken = ''

  // Process each trade in chronological order
  for (const trade of sortedTrades) {
    if (trade.tradeType === 'buy' && BASE_TOKENS.includes(trade.inputMint)) {
      const mint = trade.outputMint

      // Skip if we're buying SOL/USDC (not relevant for token positions)
      if (BASE_TOKENS.includes(mint)) continue

      if (!tokenBuyHistory.has(mint)) {
        tokenBuyHistory.set(mint, [])
      }

      const costUSD = trade.inputValueUSD || 0
      const amount = trade.outputAmount
      const pricePerToken = amount > 0 && costUSD > 0 ? costUSD / amount : 0

      tokenBuyHistory.get(mint)!.push({
        amount,
        costUSD,
        pricePerToken,
        timestamp: trade.timestamp,
        transaction: trade,
      })
    } else if (
      trade.tradeType === 'sell' &&
      BASE_TOKENS.includes(trade.outputMint)
    ) {
      const mint = trade.inputMint

      // Skip if we're selling SOL/USDC (not relevant for token positions)
      if (BASE_TOKENS.includes(mint)) continue

      const buyHistory = tokenBuyHistory.get(mint) || []

      if (buyHistory.length === 0) {
        // No buy history for this token, skip this sell
        continue
      }

      let remainingToSell = trade.inputAmount
      let totalCostBasis = 0
      const sellRevenueUSD = trade.outputValueUSD || 0
      const sellPricePerToken =
        trade.inputAmount > 0 && sellRevenueUSD > 0
          ? sellRevenueUSD / trade.inputAmount
          : 0

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
        const tradePnL = proportionalRevenue - totalCostBasis

        realizedPnLUSD += tradePnL

        // Track best trade if enabled
        if (trackBestTrade && tradePnL > bestTradeProfit) {
          bestTradeProfit = tradePnL
          bestTradeToken = mint
        }

        // Create position for this sell if needed
        if (includePositions) {
          const isIncomplete = !trade.inputValueUSD || !trade.outputValueUSD
          let incompleteReason = ''
          if (!trade.inputValueUSD && !trade.outputValueUSD) {
            incompleteReason = 'Missing input and output USD values'
          } else if (!trade.inputValueUSD) {
            incompleteReason = 'Missing input USD value'
          } else if (!trade.outputValueUSD) {
            incompleteReason = 'Missing output USD value'
          }

          const averageBuyPrice =
            actualSoldAmount > 0 && totalCostBasis > 0
              ? totalCostBasis / actualSoldAmount
              : 0

          const closedPosition: TokenPosition = {
            mint,
            symbol: mint.substring(0, 8),
            totalBought: actualSoldAmount,
            totalSold: actualSoldAmount,
            remainingTokens: 0,
            totalCostUSD: totalCostBasis,
            totalRevenueUSD: proportionalRevenue,
            realizedPnLUSD: tradePnL,
            isOpen: false,
            transactions: [trade],
            averageBuyPriceUSD: averageBuyPrice,
            averageSellPriceUSD: sellPricePerToken,
            positionId: trade.transactionSignature,
            isIncomplete,
            incompleteReason: incompleteReason || undefined,
            soldAmount: actualSoldAmount,
            soldPrice: sellPricePerToken,
            costBasis: totalCostBasis,
          }

          positions.push(closedPosition)
        }
      }
    }
    // Swaps are ignored for realized PnL
  }

  // Create open positions for remaining tokens if needed
  if (includePositions) {
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
        (buy) =>
          !buy.transaction.inputValueUSD || !buy.transaction.outputValueUSD
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
  }

  // Calculate win rate from positions if we have them, otherwise use a simplified approach
  let winRate = 0
  if (includePositions) {
    const closedPositions = positions.filter(
      (p) => !p.isOpen && !p.isIncomplete
    )
    const profitablePositions = closedPositions.filter(
      (p) => p.realizedPnLUSD > 0
    )
    winRate =
      closedPositions.length > 0
        ? (profitablePositions.length / closedPositions.length) * 100
        : 0
  } else {
    // Simplified win rate calculation - count profitable vs unprofitable trades
    // This is a rough approximation but much faster
    const sellTrades = sortedTrades.filter(
      (t) => t.tradeType === 'sell' && BASE_TOKENS.includes(t.outputMint)
    )

    let profitableTrades = 0
    let totalTrades = 0

    for (const sell of sellTrades) {
      if (!BASE_TOKENS.includes(sell.inputMint)) {
        totalTrades++
        // Simple heuristic: if this sell looks profitable based on limited info
        // This is rough but avoids full FIFO recalculation
        const sellValue = sell.outputValueUSD || 0
        const sellAmount = sell.inputAmount
        if (sellValue > 0 && sellAmount > 0) {
          // Look for recent buys of the same token as a rough comparison
          const recentBuys = sortedTrades.filter(
            (t) =>
              t.tradeType === 'buy' &&
              t.outputMint === sell.inputMint &&
              t.timestamp < sell.timestamp &&
              sell.timestamp - t.timestamp < 30 * 24 * 60 * 60 * 1000 // Within 30 days
          )

          if (recentBuys.length > 0) {
            const avgBuyPrice =
              recentBuys.reduce((sum, buy) => {
                const price = (buy.inputValueUSD || 0) / buy.outputAmount
                return sum + price
              }, 0) / recentBuys.length

            const sellPrice = sellValue / sellAmount
            if (sellPrice > avgBuyPrice * 1.01) {
              // At least 1% profit
              profitableTrades++
            }
          }
        }
      }
    }

    winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0
  }

  return {
    realizedPnLUSD,
    tradeCount: uniqueTrades.length,
    winRate,
    bestTrade: {
      profit:
        isFinite(bestTradeProfit) && bestTradeProfit > -Infinity
          ? bestTradeProfit
          : 0,
      token: bestTradeToken || '---',
    },
    positions: includePositions ? positions : undefined,
  }
}

/**
 * Lightweight version that only calculates realized PnL
 * Use this when you only need the total PnL and not other metrics
 */
export function calculateRealizedPnL(trades: TradeLogData[]): number {
  const result = calculatePnLMetrics(trades, {
    includePositions: false,
    trackBestTrade: false,
  })
  return result.realizedPnLUSD
}
