import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

interface FollowRequestBody {
  followerUser: { username: string }
  followeeUser: { username: string }
}

// Define the expected response type
interface TapestryResponse {
  error?: string
  // Add other expected response properties here
  [key: string]: any // For other unknown properties
}

export async function POST(req: NextRequest) {
  try {
    const { followerUser, followeeUser }: FollowRequestBody = await req.json()

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

    const response = await fetchTapestryServer<TapestryResponse>({
      endpoint: 'followers/add',
      method: FetchMethod.POST,
      data: bodyData,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    // Only log non-404 errors
    if (!error.message?.includes('status: 404')) {
      console.error('Error processing follow request:', error)
    }

    // Handle specific error cases
    if (error.message?.includes('status: 404')) {
      return NextResponse.json(
        { error: 'Follow endpoint not found' },
        { status: 404 }
      )
    }

    if (
      error.message?.includes('status: 401') ||
      error.message?.includes('status: 403')
    ) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
