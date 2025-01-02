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
    const searchParams = request.nextUrl.searchParams
    const useNewApi = searchParams.get('useNewApi') !== 'false' // defaults to true if not specified
    console.log({ useNewApi })
    const endpoint = useNewApi
      ? `profiles/new/${username}`
      : `profiles/${username}`

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
