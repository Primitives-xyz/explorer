import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { determineRouteType, ERouteType } from '@/utils/entity'
import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from '@solana/actions'
import { Connection, PublicKey } from '@solana/web3.js'
import { NextRequest } from 'next/server'

// Set blockchain (mainnet or devnet)
const blockchain =
  process.env.NEXT_PUBLIC_NETWORK === 'devnet'
    ? BLOCKCHAIN_IDS.devnet
    : BLOCKCHAIN_IDS.mainnet

// Create connection instance
const connection = new Connection(
  process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
)

// Headers for the Blink API
const headers = {
  ...ACTIONS_CORS_HEADERS,
  'x-blockchain-ids': blockchain,
  'x-action-version': '2.4',
}

// Helper function to validate route type for blinks
async function validateRouteTypeForBlink(username: string) {
  const routeType = await determineRouteType(username, connection)

  // Only allow profiles and wallets for blinks
  if (routeType !== ERouteType.PROFILE && routeType !== ERouteType.WALLET) {
    throw new Error(
      `Blinks are only available for profiles and wallets. ${routeType} is not supported.`
    )
  }

  return routeType
}

// OPTIONS endpoint for CORS preflight
export const OPTIONS = async () => {
  return new Response(null, { headers })
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
      { status: 400, headers }
    )
  }

  try {
    // Validate route type
    const routeType = await validateRouteTypeForBlink(username)

    // Handle wallet addresses by trying to get their username
    let displayUsername = username
    let actualUsername = username

    if (routeType === ERouteType.WALLET) {
      const cleanWallet = username.startsWith('@')
        ? username.slice(1)
        : username
      try {
        const profileResponse = await fetchTapestryServer({
          endpoint: `profiles?walletAddress=${cleanWallet}`,
          method: FetchMethod.GET,
        })
        const profile = profileResponse?.profiles?.[0]
        if (profile?.profile?.username) {
          displayUsername = profile.profile.username
          actualUsername = profile.profile.username
        } else {
          // No profile found for this wallet - not followable
          return new Response(
            JSON.stringify({
              error: `This wallet address doesn't have a profile on Tapestry and cannot be followed.`,
            }),
            { status: 400, headers }
          )
        }
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: `This wallet address doesn't have a profile on Tapestry and cannot be followed.`,
          }),
          { status: 400, headers }
        )
      }
    }

    // Get the host from the request for absolute URLs
    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`

    // Try to get user's profile image
    let userIcon = `${baseUrl}/default-profile.png`
    try {
      const profileResponse = await fetchTapestryServer({
        endpoint: `profiles/new/${actualUsername}`,
        method: FetchMethod.GET,
      })
      if (profileResponse?.profile?.image) {
        userIcon = profileResponse.profile.image
      }
    } catch (err) {
      // Use default icon if profile lookup fails
      userIcon = `https://api.dicebear.com/7.x/shapes/svg?seed=${actualUsername}`
    }

    const response: ActionGetResponse = {
      type: 'action',
      icon: userIcon,
      title: `Follow @${displayUsername}`,
      description: `Sign a message to follow @${displayUsername} on Tapestry Protocol - the decentralized social graph for Solana`,
      label: `Follow @${displayUsername}`,
      disabled: false,
      links: {
        actions: [
          {
            label: `Follow @${displayUsername}`,
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
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers,
    })
  }
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
      { status: 400, headers }
    )
  }

  try {
    // Validate route type
    const routeType = await validateRouteTypeForBlink(usernameToFollow)
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

    // Get followee's profile ID - handle both profiles and wallets
    let followeeProfileId: string
    if (routeType === ERouteType.WALLET) {
      const cleanWallet = usernameToFollow.startsWith('@')
        ? usernameToFollow.slice(1)
        : usernameToFollow
      try {
        const followeeProfile = await fetchTapestryServer({
          endpoint: `profiles?walletAddress=${cleanWallet}`,
          method: FetchMethod.GET,
        })
        const profile = followeeProfile?.profiles?.[0]
        if (profile?.profile?.username) {
          followeeProfileId = profile.profile.username
        } else {
          throw new Error('No profile found for this wallet')
        }
      } catch (err) {
        return new Response(
          JSON.stringify({
            error:
              "This wallet address doesn't have a profile on Tapestry and cannot be followed.",
          }),
          { status: 400, headers }
        )
      }
    } else {
      // It's a profile
      try {
        const followeeProfile = await fetchTapestryServer({
          endpoint: `profiles/new/${usernameToFollow}`,
          method: FetchMethod.GET,
        })
        followeeProfileId =
          followeeProfile?.profile?.username || usernameToFollow
      } catch (err) {
        followeeProfileId = usernameToFollow // fallback to username
      }
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
      message: `Sign to follow @${followeeProfileId}`,
      type: 'transaction',
      // No finalize step needed - user submits directly to Solana
    }

    return new Response(JSON.stringify(actionResponse), {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Error creating follow transaction:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers }
    )
  }
}
