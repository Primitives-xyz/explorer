import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: { username: string }
}

console.log('🔥 FOLLOWING ROUTE MODULE LOADED 🔥')

export async function GET(req: NextRequest, context: RouteContext) {
  console.log('🔥 FOLLOWING ENDPOINT HIT 🔥')
  console.log('Request URL:', req.url)
  console.log('Request method:', req.method)
  try {
    const { username } = context.params
    console.log('🔥 USERNAME FROM PARAMS:', username)
    console.log('🔥 FULL PARAMS:', context.params)

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 },
      )
    }

    const response = await fetchTapestryServer({
      endpoint: `profiles/${username}/following`,
      method: FetchMethod.GET,
    })
    console.log('🔥 TAPESTRY RESPONSE:', response)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('🔥 ERROR IN FOLLOWING ENDPOINT:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch following' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
