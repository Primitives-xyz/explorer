// app/api/profiles/suggested/route.ts
import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

export interface ITwitterFeed {
  handle: string
  tweets: {
    id: string
    text: string
    createdAt: string
    likes: number
    retweets: number
    url: string
  }[]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const handle = searchParams.get('handle')

  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
  }

  try {
    const response = await fetchTapestryServer<ITwitterFeed>({
      endpoint: `external/twitter/users/${handle}/tweets`,
      method: FetchMethod.GET,
    })

    console.log('Response from Tapestry:', response)

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 500 })
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching tweets:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tweets' },
      { status: 500 }
    )
  }
}
