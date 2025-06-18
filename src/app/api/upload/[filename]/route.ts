import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { verifyRequestAuth, getUserIdFromToken } from '@/utils/auth'
import { NextResponse, type NextRequest } from 'next/server'

type RouteContext = {
  params: Promise<{ filename: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // Verify authentication
    const verifiedToken = await verifyRequestAuth(request.headers)
    if (!verifiedToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = getUserIdFromToken(verifiedToken)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const params = await context.params
    const { filename } = params

    // Properly await and validate the filename parameter
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    const decodedFilename = decodeURIComponent(filename)

    const data = await fetchTapestryServer({
      endpoint: `upload/${encodeURIComponent(decodedFilename)}`,
      method: FetchMethod.POST,
    })

    // Validate the response contains a postUrl
    if (!data?.postUrl) {
      console.error('Invalid response from Tapestry:', data)
      return NextResponse.json(
        { error: 'Invalid response from upload service' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      postUrl: data.postUrl,
      filename: decodedFilename,
    })
  } catch (error) {
    console.error('Error processing upload URL request:', error)
    return NextResponse.json(
      { error: 'Failed to get upload URL' },
      { status: 500 }
    )
  }
}
