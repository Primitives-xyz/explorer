import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostResponse,
} from '@solana/actions'
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

  const response: ActionGetResponse = {
    type: 'action',
    icon: '/default-profile.png',
    title: `Follow @${username}`,
    description: `Sign a message to follow @${username} on Tapestry`,
    label: `Follow @${username}`,
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: ACTIONS_CORS_HEADERS,
  })
}

// POST: Ask the user to sign a follow message
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
    // 1. Ensure follower has a profile (lookup by wallet address -> username)
    let followerUsername: string = account
    try {
      const existing = await fetchTapestryServer({
        endpoint: `profiles?walletAddress=${account}`,
        method: FetchMethod.GET,
      })
      if (existing?.profiles?.[0]?.username) {
        followerUsername = existing.profiles[0].username
      } else {
        // create profile
        const created = await fetchTapestryServer({
          endpoint: 'profiles/findOrCreate',
          method: FetchMethod.POST,
          data: {
            username: account,
            walletAddress: account,
            blockchain: 'SOLANA',
            execution: 'FAST_UNCONFIRMED',
            image: `https://api.dicebear.com/7.x/shapes/svg?seed=${account}`,
            properties: [],
          },
        })
        followerUsername = created?.profile?.username || account
      }
    } catch (err) {
      console.error('Error ensuring follower profile:', err)
    }

    // 2. If the target username is actually a wallet address, resolve profile
    let endId = usernameToFollow
    try {
      const prof = await fetchTapestryServer({
        endpoint: `profiles/new/${usernameToFollow}`,
        method: FetchMethod.GET,
      })
      if (prof?.profile?.username) {
        endId = prof.profile.username
      }
    } catch (err) {
      // ignore, maybe user is raw wallet
    }

    // 3. Call followers/add
    await fetchTapestryServer({
      endpoint: 'followers/add',
      method: FetchMethod.POST,
      data: {
        startId: followerUsername,
        endId,
      },
    })

    const response: ActionPostResponse = {
      type: 'post',
      message: `Successfully followed @${endId}`,
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: ACTIONS_CORS_HEADERS,
    })
  } catch (error: any) {
    console.error('Error processing follow request:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    )
  }
}
