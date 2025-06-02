import { ICryptoChallengePaymentStatus } from '@/components/pudgy/solana-payment.models'
import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params

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
