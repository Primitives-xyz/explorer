// TODO IMPLEMENT BACKEND SERVICE TO FETCH POSITIONS DIRECTLY
import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

export interface Position {
  mint: string
  symbol: string
  name: string
  image?: string
  averageBuyPrice: number // in SOL
  totalAmount: number // in tokens
  totalInvested: number // in SOL
  currentPrice: number // in SOL
  currentValue: number // in SOL
  pnl: number // in SOL
  pnlPercent: number
  pnlUSD?: number // in USD if SOL price available
  firstBuyTimestamp: number
  lastTradeTimestamp: number
  tradeCount: number
  platform: 'trenches' | 'main'
}

export interface PositionsResponse {
  positions: Position[]
  totalValue: number // in SOL
  totalInvested: number // in SOL
  totalPnL: number // in SOL
  totalPnLPercent: number
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('walletAddress')
    const profileId = searchParams.get('profileId')
    const platform = searchParams.get('platform') // 'trenches', 'main', or 'all'
    const includeClosedPositions =
      searchParams.get('includeClosedPositions') === 'true'

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
    if (platform) params.append('platform', platform)
    if (includeClosedPositions) params.append('includeClosedPositions', 'true')

    // Fetch positions data from Tapestry
    const response = await fetchTapestryServer<PositionsResponse>({
      endpoint: `trades/positions?${params.toString()}`,
      method: FetchMethod.GET,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching positions data from Tapestry:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch positions data',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
