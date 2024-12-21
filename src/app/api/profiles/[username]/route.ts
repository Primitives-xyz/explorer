import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: { username: string } },
) {
  try {
    const params = await Promise.resolve(context.params)
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
