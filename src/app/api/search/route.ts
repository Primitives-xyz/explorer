import { fetchTapestry } from '@/components-new-version/tapestry/api/fetch-tapestry'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const pageSize = searchParams.get('pageSize')

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetchTapestry({
      endpoint: 'search/profiles',
      queryParams: {
        query,
        includeExternalProfiles: 'true',
        pageSize: pageSize || 10,
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Profile search error:', error)

    return NextResponse.json(
      { error: 'Failed to search profiles' },
      { status: 500 }
    )
  }
}
