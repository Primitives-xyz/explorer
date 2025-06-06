import {
  IPudgyUpgradeCallbackInput,
  IPudgyUpgradeCallbackResponse,
} from '@/components/pudgy/pudgy-payment.models'
import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { FetchMethod } from '@/utils/api/api.models'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ username: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params
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
