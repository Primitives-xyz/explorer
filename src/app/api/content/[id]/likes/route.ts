import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params

    const result = await fetchTapestryServer({
      endpoint: `likes/${id}/profiles`,
      method: FetchMethod.GET,
    })

    return Response.json(result)
  } catch (error) {
    console.error('Error fetching content likes:', error)
    return Response.json(
      { error: 'Failed to fetch content likes' },
      { status: 500 }
    )
  }
}
