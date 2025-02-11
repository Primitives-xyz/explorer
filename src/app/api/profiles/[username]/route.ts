import { verifyAuthToken } from '@/lib/auth'
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

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 },
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return NextResponse.json(
        { error: 'Invalid authorization header format' },
        { status: 401 },
      )
    }

    const token = parts[1]
    if (!token) {
      return NextResponse.json({ error: 'Token missing' }, { status: 401 })
    }

    const verifiedToken = await verifyAuthToken(token)
    if (!verifiedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { username, bio, image, properties } = await request.json()
    const params = await context.params
    const { username: profileUsername } = params

    // Call Tapestry API to update profile using fetchTapestryServer
    const data = await fetchTapestryServer({
      endpoint: `profiles/${profileUsername}`,
      method: FetchMethod.PUT,
      data: {
        username,
        bio,
        image,
        execution: 'FAST_UNCONFIRMED',
        properties: properties,
      },
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
