//TODO IMPLEMENT BACKEND SERVICE TO FETCH PNL DIRECTLY
import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

export interface PnLData {
  totalPnL: number // in SOL
  totalPnLUSD?: number // in USD if SOL price available
  totalPnLPercent: number
  totalInvested: number // in SOL
  currentValue: number // in SOL
  winningTrades: number
  losingTrades: number
  totalTrades: number
  winRate: number // percentage
  avgTradeSize: number // in SOL
  bestTrade: {
    pnl: number
    pnlPercent: number
    token: string
    transactionSignature: string
  }
  worstTrade: {
    pnl: number
    pnlPercent: number
    token: string
    transactionSignature: string
  }
  last7DaysPnL: number
  last30DaysPnL: number
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('walletAddress')
    const profileId = searchParams.get('profileId')
    const timeframe = searchParams.get('timeframe') || 'all' // all, 7d, 30d
    const platform = searchParams.get('platform') // 'trenches', 'main', or 'all'

    if (!walletAddress && !profileId) {
      return NextResponse.json(
        { error: 'Either walletAddress or profileId is required' },
        { status: 400 }
      )
    }

    // Build query parameters
    const params = new URLSearchParams()
    if (walletAddress) params.append('walletAddress', walletAddress)
    if (profileId) params.append('profileId', profileId)
    if (timeframe) params.append('timeframe', timeframe)
    if (platform) params.append('platform', platform)

    // Fetch PnL data from Tapestry
    const response = await fetchTapestryServer<PnLData>({
      endpoint: `trades/pnl?${params.toString()}`,
      method: FetchMethod.GET,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching PnL data from Tapestry:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch PnL data',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
