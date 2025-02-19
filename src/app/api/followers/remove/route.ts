import { socialfi } from '@/utils/socialfi'
import { NextRequest, NextResponse } from 'next/server'

interface UnfollowRequestBody {
  followerUser: { username: string }
  followeeUser: { username: string }
}

interface TapestryResponse {
  error?: string
  [key: string]: any
}

export async function POST(req: NextRequest) {
  try {
    const { followerUser, followeeUser }: UnfollowRequestBody = await req.json()

    if (!followerUser || !followeeUser) {
      return NextResponse.json(
        { error: 'followerUser and followeeUser are required' },
        { status: 400 }
      )
    }

    const bodyData = {
      startId: followerUser.username,
      endId: followeeUser.username,
    }

    const response = await socialfi.unfollowUser(
      bodyData.startId,
      bodyData.endId
    )

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error processing unfollow request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
