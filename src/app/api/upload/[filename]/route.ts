import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/lib/tapestry-server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteContext = {
  params: { filename: string }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // Properly await and validate the filename parameter
    if (!context.params?.filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 },
      )
    }

    const filename = decodeURIComponent(context.params.filename)
    console.log('Generating upload URL for:', filename)

    const data = await fetchTapestryServer({
      endpoint: `upload/${encodeURIComponent(filename)}`,
      method: FetchMethod.POST,
    })

    // Validate the response contains a postUrl
    if (!data?.postUrl) {
      console.error('Invalid response from Tapestry:', data)
      return NextResponse.json(
        { error: 'Invalid response from upload service' },
        { status: 500 },
      )
    }

    console.log('Successfully generated upload URL for:', filename)
    return NextResponse.json({
      postUrl: data.postUrl,
      filename,
    })
  } catch (error) {
    console.error('Error processing upload URL request:', error)
    return NextResponse.json(
      { error: 'Failed to get upload URL' },
      { status: 500 },
    )
  }
}
