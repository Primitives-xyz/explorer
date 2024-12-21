import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  context: { params: { username: string } },
) {
  try {
    const params = await Promise.resolve(context.params)
    const { username } = params

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 },
      )
    }

    console.log('[Followers API Debug] Fetching followers for:', {
      username,
      url: `profiles/${username}/followers`,
      env: process.env.NODE_ENV,
      tapestryUrl: process.env.TAPESTRY_URL,
    })

    const response = await fetchTapestryServer({
      endpoint: `profiles/${username}/followers`,
      method: FetchMethod.GET,
    })

    console.log('[Followers API Debug] Response:', {
      hasProfiles: !!response?.profiles,
      profileCount: response?.profiles?.length || 0,
      page: response?.page,
      pageSize: response?.pageSize,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[Followers API Error]:', {
      username: context.params.username,
      error: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch followers' },
      { status: 500 },
    )
  }
}
