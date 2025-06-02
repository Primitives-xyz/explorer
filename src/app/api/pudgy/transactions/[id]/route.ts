import { ICryptoChallengePaymentStatus } from '@/components/pudgy/solana-payment.models'
import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const response = await fetchTapestry<ICryptoChallengePaymentStatus>({
      endpoint: `transactions/${id}`,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching transaction status:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction status' },
      { status: 500 }
    )
  }
}
