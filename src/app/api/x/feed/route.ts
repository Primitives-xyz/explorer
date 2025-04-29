// app/api/profiles/suggested/route.ts
import { ITwitterFeed } from '@/components/tapestry/models/twitter.models'
import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const handle = searchParams.get('handle')

  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
  }

  try {
    const data: ITwitterFeed = await fetchTapestryServer({
      endpoint: `external/twitter/users/${handle}/tweets`,
      method: FetchMethod.GET,
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching tweets:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tweets' },
      { status: 500 }
    )
  }
}
