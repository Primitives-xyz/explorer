import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/lib/tapestry-server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteContext = {
  params: Promise<{ filename: string }>
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { filename } = params

    // Properly await and validate the filename parameter
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 },
      )
    }

    const decodedFilename = decodeURIComponent(filename)
    console.log('Generating upload URL for:', decodedFilename)

    const data = await fetchTapestryServer({
      endpoint: `upload/${encodeURIComponent(decodedFilename)}`,
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

    console.log('Successfully generated upload URL for:', decodedFilename)
    return NextResponse.json({
      postUrl: data.postUrl,
      filename: decodedFilename,
    })
  } catch (error) {
    console.error('Error processing upload URL request:', error)
    return NextResponse.json(
      { error: 'Failed to get upload URL' },
      { status: 500 },
    )
  }
}
