import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ username: string }>
}

// Add cache configuration
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET(request: NextRequest, context: RouteContext) {
  let username = ''

  try {
    const params = await context.params
    username = params.username

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

    // Handle 404 specifically
    if (
      error instanceof Error &&
      error.message.includes('API endpoint not found')
    ) {
      return NextResponse.json(
        { error: `Profile not found: ${username}` },
        { status: 404 },
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
