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
  const description = `Follow @${username} on Explorer`

  // Construct absolute URL for OG image
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const ogImageUrl = `${baseUrl}/api/og?${new URLSearchParams({
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
}
