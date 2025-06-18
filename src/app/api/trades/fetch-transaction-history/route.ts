import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const since = searchParams.get('since')
    const until = searchParams.get('until')
    const limit = searchParams.get('limit') || '100'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching transaction history for wallet:', {
      walletAddress: walletAddress.substring(0, 8),
      since: since ? new Date(parseInt(since) * 1000).toISOString() : 'none',
      until: until ? new Date(parseInt(until) * 1000).toISOString() : 'none',
      limit,
      sortOrder,
    })

    // Build query string
    const params = new URLSearchParams({
      walletAddress,
      limit,
      sortOrder,
    })

    if (since) params.append('since', since)
    if (until) params.append('until', until)

    const response = await fetchTapestryServer({
      endpoint: `trades/fetch-transaction-history?${params.toString()}`,
      method: FetchMethod.GET,
    })

    console.log('📊 Transaction history response:', {
      walletAddress: walletAddress.substring(0, 8),
      transactionCount: response?.data?.length || 0,
      total: response?.meta?.total,
      hasMore: response?.meta?.hasMore,
      oldestTimestamp: response?.meta?.oldestTimestamp
        ? new Date(response.meta.oldestTimestamp * 1000).toISOString()
        : 'none',
      newestTimestamp: response?.meta?.newestTimestamp
        ? new Date(response.meta.newestTimestamp * 1000).toISOString()
        : 'none',
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ Error fetching transaction history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    )
  }
}
