import { socialfi } from '@/utils/socialfi'
import { NextRequest } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    console.log('POST 1')
    const { profileId } = await request.json()
    console.log('POST 2', profileId)
    const params = await context.params
    const { id } = params
    console.log('POST 3', id)
    if (!profileId) {
      return Response.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    await socialfi.api.likes.likesCreate(
      {
        nodeId: id,
      },
      {
        startId: profileId,
      }
    )
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error liking content:', error)
    return Response.json({ error: 'Failed to like content' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params
    const { profileId } = await request.json()

    if (!profileId) {
      return Response.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    await socialfi.api.likes.likesDelete(
      {
        nodeId: id,
      },
      {
        startId: profileId,
      }
    )
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error unliking content:', error)
    return Response.json({ error: 'Failed to unlike content' }, { status: 500 })
  }
}
