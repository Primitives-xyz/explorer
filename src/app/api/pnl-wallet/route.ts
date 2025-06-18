import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

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
}

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const since = searchParams.get('since')
    const until = searchParams.get('until')
    const limit = searchParams.get('limit') || '1000' // Higher default for PnL calculations
    const sortOrder = searchParams.get('sortOrder') || 'desc'

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
