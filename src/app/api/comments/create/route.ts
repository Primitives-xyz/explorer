// app/api/comments/create/route.ts
import { tapestryServer } from '@/utils/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, text, contentId, commentId } = body

    if (!profileId || !text || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const response = await tapestryServer.createComment({
      profileId,
      contentId,
      text,
      ...(commentId && { commentId }),
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Create Comment Error]:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create comment',
      },
      { status: 500 }
    )
  }
}
