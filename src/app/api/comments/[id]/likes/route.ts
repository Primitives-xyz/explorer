import { tapestryServer } from '@/utils/tapestry-server'
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

    const result = await tapestryServer.likeComment(id, profileId)
    return Response.json(result)
  } catch (error) {
    console.error('Error liking comment:', error)
    return Response.json({ error: 'Failed to like comment' }, { status: 500 })
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

    const result = await tapestryServer.unlikeComment(id, profileId)
    return Response.json(result)
  } catch (error) {
    console.error('Error unliking comment:', error)
    return Response.json({ error: 'Failed to unlike comment' }, { status: 500 })
  }
}
