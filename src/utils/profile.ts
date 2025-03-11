import { FetchMethod } from '@/utils/api'
import { ProfileMetadata } from '@/utils/metadata/profile-metadata'
import { fetchTapestryServer } from '@/utils/tapestry-server'

/**
 * Gets the profile metadata for a given username
 */
export async function getProfileMetadata(
  username: string
): Promise<ProfileMetadata | null> {
  try {
    const endpoint = `profiles/new/${username}`
    const data = await fetchTapestryServer({
      endpoint,
      method: FetchMethod.GET,
    })

    return {
      image: data.profile?.image || null,
      bio: data.profile?.bio || null,
      socialCounts: data.socialCounts || { followers: 0, following: 0 },
      walletAddress: data.walletAddress || '',
    }
  } catch (error) {
    console.error('Error fetching profile metadata:', error)
    return null
  }
}
