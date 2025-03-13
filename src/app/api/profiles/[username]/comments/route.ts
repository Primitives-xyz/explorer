import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ username: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { username } = params
    const requestingProfileId = req.nextUrl.searchParams.get(
      'requestingProfileId'
    )

    let url = `comments?targetProfileId=${username}`
    if (requestingProfileId) {
      url += `&requestingProfileId=${requestingProfileId}`
    }

    const response = await fetchTapestryServer({
      endpoint: url,
      method: FetchMethod.GET,
    })

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
      { status: 500 }
    )
  }
}
