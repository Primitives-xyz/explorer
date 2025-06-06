import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ username: string }>
}

// Add cache configuration
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { username } = params

    const searchParams = _req.nextUrl.searchParams
    const namespace = searchParams.get('namespace')
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Build query string with all parameters
    const queryParams = new URLSearchParams()
    if (namespace) queryParams.set('namespace', namespace)
    if (page) queryParams.set('page', page)
    if (pageSize) queryParams.set('pageSize', pageSize)

    const queryString = queryParams.toString()
    const endpoint = `profiles/${username}/followers${
      queryString ? `?${queryString}` : ''
    }`

    const response = await fetchTapestryServer({
      endpoint,
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
      { status: 500 }
    )
  }
}
