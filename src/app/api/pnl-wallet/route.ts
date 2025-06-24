import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import {
  calculatePnLMetrics,
  type TokenPosition,
  type TradeLogData,
} from '@/utils/pnl-calculations'
import { NextRequest, NextResponse } from 'next/server'

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

    // Calculate PnL and stats using shared utility for consistent calculations
    const pnlResult = calculatePnLMetrics(trades, {
      includePositions, // Only calculate positions if requested
      trackBestTrade: true, // Always track best trade
    })

    const walletStats: WalletPnLStats = {
      walletAddress,
      realizedPnLUSD: pnlResult.realizedPnLUSD,
      tradeCount: pnlResult.tradeCount,
      winRate: pnlResult.winRate,
      bestTrade: pnlResult.bestTrade,
      dateRange: {
        since: since ? parseInt(since) : undefined,
        until: until ? parseInt(until) : undefined,
      },
      positions: pnlResult.positions, // Will be undefined if not requested
    }

    return NextResponse.json({ stats: walletStats })
  } catch (error: any) {
    console.error('❌ Error calculating wallet PnL:', error)
    return NextResponse.json(
      { error: 'Failed to calculate wallet PnL' },
      { status: 500 }
    )
  }
}
