import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { IFollowersAddRemoveInput } from '@/components/tapestry/models/profiles.models'
import { FetchMethod } from '@/utils/api'
import { verifyRequestAuth, getUserIdFromToken } from '@/utils/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const verifiedToken = await verifyRequestAuth(req.headers)
    if (!verifiedToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = getUserIdFromToken(verifiedToken)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const { followerUsername, followeeUsername }: IFollowersAddRemoveInput =
      await req.json()

    if (!followerUsername || !followeeUsername) {
      return NextResponse.json(
        { error: 'followerUsername and followeeUsername are required' },
        { status: 400 }
      )
    }

    // Optional: Verify that the authenticated user is the follower
    // This depends on your business logic requirements
    // if (followerUsername !== userId && followerUsername !== userWallet) {
    //   return NextResponse.json(
    //     { error: 'You can only follow on behalf of your own account' },
    //     { status: 403 }
    //   )
    // }

    const response = await fetchTapestry({
      endpoint: 'followers/add',
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
