import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'
import { TradeLogData } from '../log/route'

export interface TradeHistoryItem extends TradeLogData {
  id: string
  pnl?: number // calculated PnL for this trade (in SOL)
  pnlPercent?: number // PnL percentage for this trade
  status: 'confirmed' | 'pending' | 'failed'
}

export interface TradeHistoryResponse {
  trades: TradeHistoryItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('walletAddress')
    const profileId = searchParams.get('profileId')
    const platform = searchParams.get('platform') // 'trenches', 'main', or 'all'
    const tradeType = searchParams.get('tradeType') // 'buy', 'sell', 'swap', or 'all'
    const mint = searchParams.get('mint') // filter by specific token
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const orderBy = searchParams.get('orderBy') || 'timestamp' // timestamp, pnl, inputValueSOL
    const orderDirection = searchParams.get('orderDirection') || 'desc' // asc, desc

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
    if (tradeType) params.append('tradeType', tradeType)
    if (mint) params.append('mint', mint)
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())
    params.append('orderBy', orderBy)
    params.append('orderDirection', orderDirection)

    // Fetch trade history from Tapestry
    const response = await fetchTapestryServer<TradeHistoryResponse>({
      endpoint: `trades/history?${params.toString()}`,
      method: FetchMethod.GET,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching trade history from Tapestry:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch trade history',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
