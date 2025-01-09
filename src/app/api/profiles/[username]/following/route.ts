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

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 },
      )
    }
    console.log('calling API with username', username)
    const response = await fetchTapestryServer({
      endpoint: `profiles/${username}/following`,
      method: FetchMethod.GET,
    })
    console.log('response', response)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching following:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch following' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
