import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

interface FollowWalletRequestBody {
  followerUsername: string
  walletToFollow: string
}

export async function POST(req: NextRequest) {
  try {
    const { followerUsername, walletToFollow }: FollowWalletRequestBody =
      await req.json()

    if (!followerUsername || !walletToFollow) {
      return NextResponse.json(
        { error: 'followerUsername and walletToFollow are required' },
        { status: 400 }
      )
    }

    // First check if profile exists

    const existingProfile = await fetchTapestryServer({
      endpoint: `profiles?walletAddress=${walletToFollow}`,
      method: FetchMethod.GET,
    })

    let profile = null
    if (existingProfile?.profiles?.[0]) {
      profile = existingProfile.profiles[0]
    } else {
      // No profile exists, create one
      const createAttempt = await fetchTapestryServer({
        endpoint: 'profiles/findOrCreate',
        method: FetchMethod.POST,
        data: {
          username: walletToFollow,
          walletAddress: walletToFollow,
          blockchain: 'SOLANA',
          execution: 'FAST_UNCONFIRMED',
          image: `https://api.dicebear.com/7.x/shapes/svg?seed=${walletToFollow}`,
          properties: [],
        },
      })

      if (!createAttempt) {
        throw new Error('Failed to create profile for wallet')
      }

      profile = createAttempt
    }

    const usernameToFollow = profile?.profile?.username || walletToFollow

    // Now follow the profile
    const followResponse = await fetchTapestryServer({
      endpoint: 'followers/add',
      method: FetchMethod.POST,
      data: {
        startId: followerUsername,
        endId: usernameToFollow,
      },
    })

    return NextResponse.json(followResponse)
  } catch (error: any) {
    // Only log non-404 errors
    if (!error.message?.includes('status: 404')) {
      console.error('Error processing follow wallet request:', error)
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

export const dynamic = 'force-dynamic'
