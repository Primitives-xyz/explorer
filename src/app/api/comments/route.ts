import { NextRequest, NextResponse } from 'next/server'

const TAPESTRY_URL = process.env.TAPESTRY_URL
const API_KEY = process.env.TAPESTRY_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    console.log('searchParams::::::', searchParams)
    const targetProfileId = searchParams.get('targetProfileId')
    console.log('targetProfileId::::::', targetProfileId)

    const requestingProfileId = searchParams.get('requestingProfileId')
    console.log('requestingProfileId::::::', requestingProfileId)

    if (!targetProfileId) {
      return NextResponse.json(
        { error: 'Target profile ID is required' },
        { status: 400 },
      )
    }

    const url = `${TAPESTRY_URL}comments?apiKey=${API_KEY}&targetProfileId=${targetProfileId}&profileId=${requestingProfileId}`

    console.log('url::::::', url)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }

    const comments = await response.json()
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 },
    )
  }
}
