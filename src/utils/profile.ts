import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'

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
    console.log('$$$$$$')
    console.log(username)
    const endpoint = `profiles/new/${username}`
    console.log('ENDPOINT', endpoint)
    const data = await fetchTapestryServer({
      endpoint,
      method: FetchMethod.GET,
    })

    console.log('$$$$$$')
    console.log(JSON.stringify(data, null, 2))

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
