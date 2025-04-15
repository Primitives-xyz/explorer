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

    const { username } = params
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }
    const response = await fetchTapestryServer({
      endpoint: `profiles/${username}/following${
        namespace ? `?namespace=${namespace}` : ''
      }`,
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
