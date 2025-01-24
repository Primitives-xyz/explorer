import { NextRequest, NextResponse } from 'next/server'
import { tapestryServer } from '@/lib/tapestry-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, targetProfileId, text } = body

    if (!profileId || !targetProfileId || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    const response = await tapestryServer.createComment({
      profileId,
      contentId: targetProfileId,
      text,
    })

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
