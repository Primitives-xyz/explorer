import { IGetProfileResponse } from '@/types/profile.types'
import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { verifyAuthToken } from '@/utils/auth'
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
    const namespace = searchParams.get('namespace')

    let endpoint = `profiles/new/${username}`

    if (fromUsername) {
      endpoint = `profiles/new/${username}?username=${fromUsername}`
    }

    if (namespace) {
      endpoint = `profiles/${username}?namespace=${namespace}`
    }

    const data: IGetProfileResponse = await fetchTapestryServer({
      endpoint,
      method: FetchMethod.GET,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.warn('[API] Profile not found or error fetching:', error)

    return NextResponse.json(
      { error: `Profile not found: ${username}` },
      { status: 404 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return NextResponse.json(
        { error: 'Invalid authorization header format' },
        { status: 401 }
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
        properties,
      },
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
