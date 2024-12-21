import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ username: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { username } = params

    const data = await fetchTapestryServer({
      endpoint: `profiles/${username}`,
      method: FetchMethod.GET,
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
