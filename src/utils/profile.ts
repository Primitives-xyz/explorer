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
    // Use TAPESTRY_URL for server-side requests
    const baseUrl =
      process.env.TAPESTRY_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'
    const apiKey = process.env.TAPESTRY_API_KEY

    if (!baseUrl || !apiKey) {
      console.error('Missing required environment variables for profile fetch')
      return null
    }

    // Add timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const url = `${baseUrl}/profiles/new/${username}`
    console.log('URL', url)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        Accept: 'application/json',
      },
    })

    clearTimeout(timeoutId)

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
