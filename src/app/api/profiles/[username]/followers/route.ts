import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  const { username } = params

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    const response = await fetchTapestryServer({
      endpoint: `profiles/${username}/followers`,
      method: FetchMethod.GET,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching followers:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch followers' },
      { status: 500 },
    )
  }
}
