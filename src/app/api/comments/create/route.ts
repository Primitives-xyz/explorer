// app/api/comments/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { tapestryServer } from '@/lib/tapestry-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, text, contentId, commentId, targetProfileId } = body

    if (!profileId || !text || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // TODO: Uncomment and update tapestry server implementation
    // const response = await tapestryServer.createComment({
    //   profileId,
    //   contentId,
    //   text,
    //   ...(commentId && { commentId }),
    //   ...(targetProfileId && { targetProfileId }),
    // })

    // Mock response for now
    const response = {
      id: Math.random().toString(36).substring(7),
      profileId,
      contentId,
      text,
      commentId,
      targetProfileId,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Create Comment Error]:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create comment',
      },
      { status: 500 },
    )
  }
}
