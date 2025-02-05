import type { Metadata } from 'next'
import { getProfileMetadata } from '@/utils/profile'

/**
 * Generates metadata for a profile
 */
export async function generateProfileMetadata(
  username: string,
): Promise<Metadata> {
  const profileData = await getProfileMetadata(username)
  const title = `@${username}`
  const description = profileData?.socialCounts
    ? `Follow @${username} on Explorer • ${profileData.socialCounts.followers} followers • ${profileData.socialCounts.following} following`
    : `Follow @${username} on Explorer to see their activity on Solana`

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

  console.log(ogImageUrl)

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
