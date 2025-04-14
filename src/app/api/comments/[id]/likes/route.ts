import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
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

    const result = await fetchTapestryServer({
      endpoint: `likes/${id}`,
      method: FetchMethod.POST,
      data: {
        startId: profileId,
      },
    })

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

    const result = await fetchTapestryServer({
      endpoint: `likes/${id}`,
      method: FetchMethod.DELETE,
      data: {
        startId: profileId,
      },
    })

    return Response.json(result)
  } catch (error) {
    console.error('Error unliking comment:', error)
    return Response.json({ error: 'Failed to unlike comment' }, { status: 500 })
  }
}
