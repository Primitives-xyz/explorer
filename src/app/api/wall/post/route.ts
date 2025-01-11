import { FetchMethod, fetchTapestry } from '@/utils/api'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { contentId, profileId, text } = await request.json()

    if (!contentId || !profileId || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a comment using the Tapestry API
    const response = await fetchTapestry({
      endpoint: 'comments',
      method: FetchMethod.POST,
      data: {
        contentId,
        profileId,
        text,
      },
    })

    if (!response) {
      throw new Error('Failed to create wall post')
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating wall post:', error)
    return NextResponse.json(
      { error: 'Failed to create wall post' },
      { status: 500 }
    )
  }
} 