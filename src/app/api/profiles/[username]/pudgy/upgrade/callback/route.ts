import {
  IPudgyUpgradeCallbackInput,
  IPudgyUpgradeCallbackResponse,
} from '@/components/pudgy/solana-payment.models'
import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { FetchMethod } from '@/utils/api/api.models'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params

  try {
    const body: IPudgyUpgradeCallbackInput = await request.json()

    const response = await fetchTapestry<
      IPudgyUpgradeCallbackResponse,
      IPudgyUpgradeCallbackInput
    >({
      endpoint: `profiles/${username}/pudgy/upgrade/callback`,
      method: FetchMethod.POST,
      body,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error processing payment:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    )
  }
}
