import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

interface UnfollowWalletRequestBody {
  followerUsername: string
  walletToFollow: string
}
export async function POST(req: NextRequest) {
  try {
    const { followerUsername, walletToFollow }: UnfollowWalletRequestBody =
      await req.json()

    if (!followerUsername || !walletToFollow) {
      return NextResponse.json(
        { error: 'followerUsername and walletToFollow are required' },
        { status: 400 },
      )
    }

    // First check if profile exists
    const existingProfile = await fetchTapestryServer({
      endpoint: `profiles?walletAddress=${walletToFollow}`,
      method: FetchMethod.GET,
    })

    // Get the username from the profile or use the wallet address as username
    const usernameToUnfollow =
      existingProfile?.profiles?.[0]?.username || walletToFollow

    // Now unfollow the profile
    const unfollowResponse = await fetchTapestryServer({
      endpoint: 'followers/remove',
      method: FetchMethod.POST,
      data: {
        startId: followerUsername,
        endId: usernameToUnfollow,
      },
    })

    if (unfollowResponse.error) {
      return NextResponse.json(
        { error: unfollowResponse.error || 'Failed to unfollow wallet' },
        { status: 500 },
      )
    }

    return NextResponse.json(unfollowResponse)
  } catch (error: any) {
    console.error('Error processing unfollow wallet request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
