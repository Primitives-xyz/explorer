import { socialfi } from '@/utils/socialfi'
import { NextRequest } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { profileId } = await request.json()
    const params = await context.params
    const { id } = params
    if (!profileId) {
      return Response.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    await socialfi.likeContent(id, profileId)
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

    await socialfi.unlikeContent(id, profileId)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error unliking content:', error)
    return Response.json({ error: 'Failed to unlike content' }, { status: 500 })
  }
}
