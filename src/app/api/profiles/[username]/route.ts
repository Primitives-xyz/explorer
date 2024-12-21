import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } },
) {
  try {
    const data = await fetchTapestryServer({
      endpoint: `profiles/${params.username}`,
      method: FetchMethod.GET,
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    )
  }
}
