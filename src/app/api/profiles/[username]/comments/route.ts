import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ username: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { username } = params

    const response = await fetchTapestryServer({
      endpoint: `comments?targetProfileId=${username}`,
      method: FetchMethod.GET,
    })

    console.log('response *******8', JSON.stringify(response))

    if (!response) {
      throw new Error('Failed to fetch comments')
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Get Comments Error]:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    )
  }
}
