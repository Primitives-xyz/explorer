import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostResponse,
} from '@solana/actions'
import { PublicKey } from '@solana/web3.js'
import { NextRequest } from 'next/server'

// helper to extract username from URL path if provided as /follow/:username
function extractUsername(url: URL): string | null {
  const queryUsername = url.searchParams.get('username')
  if (queryUsername) return queryUsername
  const segments = url.pathname.split('/')
  // expected .../follow/<username>
  const followIdx = segments.findIndex((s) => s === 'follow')
  if (followIdx !== -1 && segments.length > followIdx + 1) {
    return decodeURIComponent(segments[followIdx + 1])
  }
  return null
}

// OPTIONS endpoint for CORS preflight
export const OPTIONS = async () => {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS })
}

// GET: Return metadata for the follow blink
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const username = extractUsername(url)

  if (!username) {
    return new Response(
      JSON.stringify({ error: 'username query parameter is required' }),
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
          href: `${baseUrl}/api/actions/follow/${encodeURIComponent(username)}`,
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
export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const usernameToFollow = extractUsername(url)
  const { account } = await req.json()

  if (!usernameToFollow || !account) {
    return new Response(
      JSON.stringify({ error: 'username and account are required' }),
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    )
  }

  try {
    const userPublicKey = new PublicKey(account)

    // Call your backend to create the follow relationship and get the transaction
    // The backend should:
    // 1. Create/update the follow in the database (maybe in pending state)
    // 2. Create the transaction to mint the edge on-chain
    // 3. Set the backend wallet as fee payer
    // 4. Add the user as a required signer
    // 5. Return the unsigned transaction for the user to sign
    const backendResponse = await fetchTapestryServer({
      endpoint: 'followers/createTransaction',
      method: FetchMethod.POST,
      data: {
        followerWallet: account,
        followeeUsername: usernameToFollow,
        // Tell backend this user needs to sign
        userSigner: account,
      },
    })

    if (!backendResponse?.transaction) {
      throw new Error('Failed to create follow transaction')
    }

    // The backend returns a partially signed transaction where:
    // - Backend wallet is the fee payer (not signed yet)
    // - User is required signer (needs to sign)
    // - After user signs, it goes back to backend for final signature + submission
    const response: ActionPostResponse = {
      transaction: backendResponse.transaction,
      message: `Sign to follow @${usernameToFollow}`,
      type: 'transaction',
      links: {
        next: {
          type: 'post',
          href: `/api/actions/follow/finalize`,
        },
      },
    }

    return new Response(JSON.stringify(response), {
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
