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
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api`
      : 'http://localhost:3000/api'

    const url = `${baseUrl}/profiles/${username}`
    console.log('Fetching profile from URL:', url)
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })
    console.log('RESPONSE', response)

    const data = await response.json()

    return {
      image: data.profile?.image || null,
      socialCounts: data.socialCounts || { followers: 0, following: 0 },
      walletAddress: data.walletAddress || '',
    }
  } catch (error) {
    console.error('Error fetching profile metadata:', error)
    return null
  }
}
