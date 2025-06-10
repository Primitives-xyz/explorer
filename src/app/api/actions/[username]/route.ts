import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostResponse,
} from '@solana/actions'
import { PublicKey } from '@solana/web3.js'
import { NextRequest } from 'next/server'

// OPTIONS endpoint for CORS preflight
export const OPTIONS = async () => {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS })
}

// GET: Return metadata for the follow blink
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  if (!username) {
    return new Response(
      JSON.stringify({ error: 'username parameter is required' }),
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    )
  }

  // Get the host from the request for absolute URLs
  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${host}`

  // Try to get user's profile image if they exist
  let userIcon = `${baseUrl}/default-profile.png`
  try {
    const profileResponse = await fetchTapestryServer({
      endpoint: `profiles/new/${username}`,
      method: FetchMethod.GET,
    })
    if (profileResponse?.profile?.image) {
      userIcon = profileResponse.profile.image
    }
  } catch (err) {
    // Use default icon if profile lookup fails
    userIcon = `https://api.dicebear.com/7.x/shapes/svg?seed=${username}`
  }

  const response: ActionGetResponse = {
    type: 'action',
    icon: userIcon,
    title: `Follow @${username}`,
    description: `Sign a message to follow @${username} on Tapestry Protocol - the decentralized social graph for Solana`,
    label: `Follow @${username}`,
    disabled: false,
    links: {
      actions: [
        {
          label: `Follow @${username}`,
          href: `${baseUrl}/api/actions/${encodeURIComponent(username)}`,
          type: 'transaction',
        },
      ],
    },
    error: undefined,
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      ...ACTIONS_CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

// POST: Return a transaction for the user to sign to follow someone
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username: usernameToFollow } = await params
  const { account } = await req.json()

  if (!usernameToFollow || !account) {
    return new Response(
      JSON.stringify({ error: 'username and account are required' }),
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    )
  }

  try {
    const userPublicKey = new PublicKey(account)

    // First, we need to get the profile IDs for both the follower and followee
    // Get follower's profile ID from their wallet - using the existing pattern
    let followerProfileId: string
    try {
      const followerProfile = await fetchTapestryServer({
        endpoint: `profiles?walletAddress=${account}`,
        method: FetchMethod.GET,
      })
      // Use the profile username if it exists, otherwise fall back to wallet
      followerProfileId =
        followerProfile?.profiles?.[0]?.profile?.username || account
    } catch (err) {
      followerProfileId = account // fallback to wallet
    }

    // Get followee's profile ID from their username
    let followeeProfileId: string
    try {
      const followeeProfile = await fetchTapestryServer({
        endpoint: `profiles/new/${usernameToFollow}`,
        method: FetchMethod.GET,
      })
      followeeProfileId = followeeProfile?.profile?.username || usernameToFollow
    } catch (err) {
      followeeProfileId = usernameToFollow // fallback to username
    }

    // Call your backend public endpoint to create the transaction
    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const apiBaseUrl = `${protocol}://${host}`

    const response = await fetch(
      `${apiBaseUrl}/api/followers/build-follow-transaction`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startId: followerProfileId,
          endId: followeeProfileId,
          followerWallet: account,
          namespace: 'nemoapp',
          type: 'follow',
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend error: ${response.status} - ${errorText}`)
    }

    const backendResponse = await response.json()

    if (!backendResponse?.transaction) {
      throw new Error('Failed to create follow transaction')
    }

    // The backend returns a partially signed transaction where:
    // - Backend wallet is the fee payer (not signed yet)
    // - User is required signer (needs to sign)
    // - After user signs, they submit directly to Solana
    // - Backend detects the on-chain event and updates database
    const actionResponse: ActionPostResponse = {
      transaction: backendResponse.transaction,
      message: `Sign to follow @${usernameToFollow}`,
      type: 'transaction',
      // No finalize step needed - user submits directly to Solana
    }

    return new Response(JSON.stringify(actionResponse), {
      status: 200,
      headers: ACTIONS_CORS_HEADERS,
    })
  } catch (error: any) {
    console.error('Error creating follow transaction:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    )
  }
}
