import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const { profileId } = params

    // Call Tapestry API to get comments
    const response = await fetch(
      `https://api.usetapestry.dev/v1/profiles/${profileId}/comments`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.TAPESTRY_API_KEY || '',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }

    const data = await response.json()
    return NextResponse.json({ comments: data.comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
} 