import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching transaction history for wallet:', walletAddress)

    const response = await fetchTapestryServer({
      endpoint: `trades/fetch-transaction-history?walletAddress=${walletAddress}`,
      method: FetchMethod.GET,
    })

    console.log('📊 Transaction history response:', {
      walletAddress: walletAddress.substring(0, 8),
      transactionCount: response?.length || 0,
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
