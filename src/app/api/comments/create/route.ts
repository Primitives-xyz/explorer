// app/api/comments/create/route.ts
import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { contentServer } from '@/utils/content-server'
import { sendNotification } from '@/utils/notification'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, text, contentId, commentId, properties } = body

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
        contentId,
        ...(commentId && { commentId }),
        ...(Array.isArray(properties) && properties.length > 0
          ? { properties }
          : {}),
      },
    })

    // Notify content owner of new comment
    try {
      const content = await contentServer.getContentById(contentId)
      const recipientWalletAddress = content?.authorProfile?.id || ''
      if (recipientWalletAddress && profileId !== recipientWalletAddress) {
        await sendNotification({
          notificationType: 'COMMENT_POSTED',
          recipientWalletAddress,
          authorUsername: profileId,
          contentId,
          text,
        })
      }
    } catch (e) {
      console.warn('[Create Comment] Notification send skipped:', e)
    }

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
