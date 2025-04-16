// app/api/followers/state/route.ts

import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { IGetFollowersStateResponse } from '@/components/tapestry/models/profiles.models'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const startId = searchParams.get('startId')
  const endId = searchParams.get('endId')

  if (!startId || !endId) {
    return NextResponse.json(
      { error: 'startId, and endId are required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetchTapestry<IGetFollowersStateResponse>({
      endpoint: `followers/state`,
      queryParams: {
        startId,
        endId,
      },
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error verifying follow state:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify follow state' },
      { status: 500 }
    )
  }
}
