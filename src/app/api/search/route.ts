import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const apiKey = process.env.TAPESTRY_API_KEY
  const baseUrl = process.env.TAPESTRY_URL

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  try {
    const url = `${baseUrl}/search/profiles?query=${query}&apiKey=${apiKey}&includeExternalProfiles=true`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Profile search error:', error)
    return NextResponse.json(
      { error: 'Failed to search profiles' },
      { status: 500 }
    )
  }
}
