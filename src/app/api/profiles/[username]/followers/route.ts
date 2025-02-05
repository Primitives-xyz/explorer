import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ username: string }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { username } = params

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 },
      )
    }

    const response = await fetchTapestryServer({
      endpoint: `profiles/${username}/followers`,
      method: FetchMethod.GET,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[Followers API Error]:', {
      error: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch followers' },
      { status: 500 },
    )
  }
}

// Add route configuration for caching behavior
export const dynamic = 'force-dynamic'
