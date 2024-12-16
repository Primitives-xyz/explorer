// app/api/comments/create/route.ts
import { FetchMethod, fetchTapestry } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const profileId = formData.get('profileId')?.toString()
    const contentId = formData.get('contentId')?.toString()
    const text = formData.get('text')?.toString()
    const commentId = formData.get('commentId')?.toString()

    // Validate required fields
    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 },
      )
    }
    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 },
      )
    }
    if (!text) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 },
      )
    }

    const createCommentResponse = await fetchTapestry({
      endpoint: 'comments',
      method: FetchMethod.POST,
      data: {
        profileId,
        contentId,
        text,
        ...(commentId ? { commentId } : {}),
      },
    })

    if (!createCommentResponse) {
      throw new Error('Failed to create comment')
    }

    return NextResponse.json(createCommentResponse)
  } catch (error) {
    console.error('[Create Comment Error]:', error)

    // Handle specific error types if needed
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    )
  }
}
