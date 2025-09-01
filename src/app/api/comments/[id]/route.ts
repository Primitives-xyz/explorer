import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params

    const response = await fetchTapestryServer({
      endpoint: `comments/${id}`,
      method: FetchMethod.DELETE,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Delete Comment Error]:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
