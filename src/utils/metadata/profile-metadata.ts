import type { Metadata } from 'next'
import { getProfileMetadata } from '@/utils/profile'

/**
 * Generates metadata for a profile
 */
export async function generateProfileMetadata(
  username: string,
): Promise<Metadata> {
  try {
    const profileData = await getProfileMetadata(username)
    if (!profileData) {
      console.error('No profile data returned for username:', username)
      return {
        title: `@${username} | Explorer`,
        description: `View profile of @${username} on Explorer`,
      }
    }

    console.log('Profile metadata generated for:', username, profileData)

    const title = `@${username} | Explorer`
    const description = `Follow @${username} on Explorer to see their activity on Solana`

    const ogImageUrl = `/api/og?${new URLSearchParams({
      title,
      description,
      ...(profileData?.image ? { image: profileData.image } : {}),
      ...(profileData?.socialCounts
        ? {
            followers: profileData.socialCounts.followers.toString(),
            following: profileData.socialCounts.following.toString(),
          }
        : {}),
      ...(profileData?.walletAddress
        ? { wallet: profileData.walletAddress }
        : {}),
    }).toString()}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'Explorer',
        images: [
          {
            url: ogImageUrl,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@explorer',
        site: '@explorer',
        images: [ogImageUrl],
      },
    }
  } catch (error) {
    console.error('Error generating profile metadata:', error)
    return {
      title: `@${username} | Explorer`,
      description: `View profile of @${username} on Explorer`,
    }
  }
}
