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

    // get from username from search params
    const searchParams = request.nextUrl.searchParams
    const fromUsername = searchParams.get('fromUsername')

    let endpoint = `profiles/new/${username}`

    if (fromUsername) {
      endpoint = `profiles/new/${username}?username=${fromUsername}`
    }

    const data = await fetchTapestryServer({
      endpoint,
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
