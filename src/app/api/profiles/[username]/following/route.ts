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

    const searchParams = _req.nextUrl.searchParams
    const namespace = searchParams.get('namespace')
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')

    const { username } = params
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
    const endpoint = `profiles/${username}/following${
      queryString ? `?${queryString}` : ''
    }`

    const response = await fetchTapestryServer({
      endpoint,
      method: FetchMethod.GET,
    })
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching following:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch following' },
      { status: 500 }
    )
  }
}

// Remove force-dynamic
// export const dynamic = 'force-dynamic'
