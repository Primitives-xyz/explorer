import { IPudgyUpgradeInitiateResponse } from '@/components/pudgy/solana-payment.models'
import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ username: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  const params = await context.params
  const { username } = params

  try {
    const data = await fetchTapestry<IPudgyUpgradeInitiateResponse>({
      endpoint: `profiles/${username}/pudgy/upgrade/initiate`,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.warn('[API] Error fetching Pudgy upgrade initiate:', error)

    return NextResponse.json(
      { error: `Profile not found: ${username}` },
      { status: 404 }
    )
  }
}
