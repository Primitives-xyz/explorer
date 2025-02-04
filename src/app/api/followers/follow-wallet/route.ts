import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
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
        { status: 400 },
      )
    }

    console.log(
      `[follow-wallet] Processing follow request for wallet: ${walletToFollow}`,
    )

    // First check if profile exists
    console.log('[follow-wallet] Checking for existing profile')
    const existingProfile = await fetchTapestryServer({
      endpoint: `profiles?walletAddress=${walletToFollow}`,
      method: FetchMethod.GET,
    })
    console.log(
      '[follow-wallet] Existing profile check response:',
      existingProfile,
    )

    let profile = null
    if (existingProfile?.profiles?.[0]) {
      profile = existingProfile.profiles[0]
      console.log('[follow-wallet] Found existing profile:', profile)
    } else {
      // No profile exists, create one
      console.log('[follow-wallet] No existing profile found, creating new one')
      const createAttempt = await fetchTapestryServer({
        endpoint: 'profiles/findOrCreate',
        method: FetchMethod.POST,
        data: {
          username: walletToFollow,
          walletAddress: walletToFollow,
          blockchain: 'SOLANA',
          execution: 'FAST_UNCONFIRMED',
          properties: [],
        },
      })
      console.log('[follow-wallet] Create profile response:', createAttempt)

      if (!createAttempt) {
        throw new Error('Failed to create profile for wallet')
      }

      profile = createAttempt
    }

    const usernameToFollow = profile?.profile?.username || walletToFollow
    console.log(`[follow-wallet] Final username to follow: ${usernameToFollow}`)

    // Now follow the profile
    console.log('[follow-wallet] Attempting to create follow relationship')
    const followResponse = await fetchTapestryServer({
      endpoint: 'followers/add',
      method: FetchMethod.POST,
      data: {
        startId: followerUsername,
        endId: usernameToFollow,
      },
    })
    console.log('[follow-wallet] Follow response:', followResponse)

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
        { status: 404 },
      )
    }

    if (
      error.message?.includes('status: 401') ||
      error.message?.includes('status: 403')
    ) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 },
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
