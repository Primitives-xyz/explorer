import { IFollowersAddRemoveInput } from '@/app/api/followers/add/route'
import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { followerUsername, followeeUsername }: IFollowersAddRemoveInput =
      await req.json()

    if (!followerUsername || !followeeUsername) {
      return NextResponse.json(
        { error: 'followerUsername and followeeUsername are required' },
        { status: 400 }
      )
    }

    const response = await fetchTapestry({
      endpoint: 'followers/remove',
      method: FetchMethod.POST,
      body: {
        startId: followerUsername,
        endId: followeeUsername,
      },
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error processing follow request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
