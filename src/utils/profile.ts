interface ProfileMetadata {
  image: string | null
  socialCounts: {
    followers: number
    following: number
  }
  walletAddress: string
}

/**
 * Gets the profile metadata for a given username
 */
export async function getProfileMetadata(
  username: string,
): Promise<ProfileMetadata | null> {
  try {
    // Use TAPESTRY_URL for server-side requests, fallback to Vercel URL or localhost
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
      : 'http://localhost:3000/api'

    if (!baseUrl) {
      console.error('Missing required environment variables for profile fetch')
      return null
    }

    const url = `${baseUrl}/profiles/${username}`
    console.log('Fetching profile from URL:', url)

    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data || !data.profile) {
      console.error('Invalid profile data received:', data)
      return null
    }

    return {
      image: data.profile?.image || null,
      socialCounts: data.socialCounts || { followers: 0, following: 0 },
      walletAddress: data.walletAddress || '',
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Profile metadata request timed out for:', username)
    } else {
      console.error('Error fetching profile metadata:', error)
    }
    return null
  }
}
