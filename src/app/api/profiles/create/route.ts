// app/api/profiles/create/route.ts
import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { DICEBEAR_API_BASE } from '@/utils/constants'
import { NextRequest, NextResponse } from 'next/server'

// Blocklist of reserved usernames
const RESERVED_USERNAMES = [
  'home',
  'design-system',
  'trade',
  'n',
  'discover',
  'new-trade',
  'entity',
  'stake',
  'namespace',
]

export async function POST(req: NextRequest) {
  try {
    const { username, ownerWalletAddress, profileImageUrl } = await req.json()

    // Input validation
    if (!username && !ownerWalletAddress) {
      return NextResponse.json(
        { error: 'Both username and wallet address are required' },
        { status: 400 }
      )
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    if (!ownerWalletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      )
    }

    if (username.length > 30) {
      return NextResponse.json(
        { error: 'Username must not exceed 30 characters' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        {
          error: 'Username can only contain letters, numbers, and underscores',
        },
        { status: 400 }
      )
    }

    // Check if username is in the blocklist
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 409 }
      )
    }

    // Verify environment variables
    if (!process.env.TAPESTRY_API_KEY || !process.env.TAPESTRY_URL) {
      console.error(
        '[Profile Creation Error]: Missing required environment variables'
      )
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Use provided image URL or fallback to Dicebear
    const image =
      profileImageUrl || `${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`

    // Attempt to create profile
    const createProfileResponse = await fetchTapestryServer({
      endpoint: 'profiles/findOrCreate',
      method: FetchMethod.POST,
      data: {
        username,
        walletAddress: ownerWalletAddress,
        blockchain: 'SOLANA',
        execution: 'FAST_UNCONFIRMED',
        image,
        properties: [],
      },
    })

    if (!createProfileResponse) {
      throw new Error('No response received from Tapestry API')
    }

    // Debug log successful response

    return NextResponse.json(createProfileResponse)
  } catch (error: any) {
    console.error('[Profile Creation Error]:', {
      message: error.message,
      stack: error.stack,
      endpoint: 'profiles/findOrCreate',
      apiUrl: process.env.TAPESTRY_URL,
    })

    // Handle HTTP status code errors
    if (error.message?.includes('status: 404')) {
      return NextResponse.json(
        {
          error: 'Profile creation endpoint not found',
          details:
            'The Tapestry API endpoint for profile creation is not available. Please verify the API endpoint: profiles/findOrCreate',
        },
        { status: 404 }
      )
    }

    if (
      error.message?.includes('status: 401') ||
      error.message?.includes('status: 403')
    ) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          details:
            'Failed to authenticate with the Tapestry API. Please check your API key.',
        },
        { status: 401 }
      )
    }

    // Handle specific error cases
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 409 }
      )
    }

    if (error.message?.includes('Invalid wallet address')) {
      return NextResponse.json(
        { error: 'The provided wallet address is invalid' },
        { status: 400 }
      )
    }

    // Network or connection errors
    if (
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('network')
    ) {
      return NextResponse.json(
        {
          error: 'Connection error',
          details:
            'Failed to connect to the Tapestry API. Please try again later.',
        },
        { status: 503 }
      )
    }

    // Generic error handling
    return NextResponse.json(
      {
        error: 'Failed to create profile',
        details: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
