import { NextRequest, NextResponse } from 'next/server'

const TAPESTRY_URL = process.env.NEXT_PUBLIC_TAPESTRY_URL

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetProfileId = searchParams.get('targetProfileId')

    if (!targetProfileId) {
      return NextResponse.json(
        { error: 'Target profile ID is required' },
        { status: 400 },
      )
    }

    const response = await fetch(
      `${TAPESTRY_URL}/comments?targetProfileId=${targetProfileId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

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
