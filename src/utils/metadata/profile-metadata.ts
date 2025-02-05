import type { Metadata } from 'next'
import { getProfileMetadata } from '@/utils/profile'

/**
 * Generates metadata for a profile
 */
export async function generateProfileMetadata(
  username: string,
): Promise<Metadata> {
  const profileData = await getProfileMetadata(username)
  const title = `@${username} | Explorer`
  const description = profileData?.socialCounts
    ? `Follow @${username} on Explorer • ${profileData.socialCounts.followers} followers • ${profileData.socialCounts.following} following`
    : `Follow @${username} on Explorer to see their activity on Solana`

  const ogImageUrl = `/api/og?title=${encodeURIComponent(
    title,
  )}&description=${encodeURIComponent(description)}${
    profileData?.image ? `&image=${encodeURIComponent(profileData.image)}` : ''
  }`

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
}
