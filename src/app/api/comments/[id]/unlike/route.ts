import { NextRequest } from 'next/server'
import { tapestryServer } from '@/lib/tapestry-server'

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

    const result = await tapestryServer.unlikeComment(id, profileId)
    return Response.json(result)
  } catch (error) {
    console.error('Error unliking comment:', error)
    return Response.json({ error: 'Failed to unlike comment' }, { status: 500 })
  }
}
