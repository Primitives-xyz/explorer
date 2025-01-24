import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ username: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const requestingProfileId = req.nextUrl.searchParams.get(
      'requestingProfileId',
    )
    console.log('Route - requestingProfileId:', requestingProfileId)

    const params = await context.params
    const { username } = params
    console.log('Route - username:', username)

    // Build the endpoint URL
    const queryParams = new URLSearchParams({
      targetProfileId: username,
      ...(requestingProfileId && { requestingProfileId }),
    })

    const endpoint = `comments?${queryParams.toString()}`
    console.log('Route - final endpoint:', endpoint)

    const response = await fetchTapestryServer({
      endpoint,
      method: FetchMethod.GET,
    })

    if (!response) {
      throw new Error('Failed to fetch comments')
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Get Comments Error]:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
      { status: 500 },
    )
  }
}
