// app/api/comments/create/route.ts
import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
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

    const response = await fetchTapestryServer({
      endpoint: 'comments',
      method: FetchMethod.POST,
      data: {
        profileId,
        text,
        ...(commentId && { commentId }),
      },
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
