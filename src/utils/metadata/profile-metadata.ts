import { getProfileMetadata } from '@/utils/profile'
import type { Metadata } from 'next'

/**
 * Generates metadata for a profile
 */
export async function generateProfileMetadata(
  username: string
): Promise<Metadata> {
  const profileData = await getProfileMetadata(username)
  const title = `@${username}`
  const description = `Follow @${username} on Explorer`

  // Truncate bio after 2 lines if needed
  const truncatedBio = profileData?.bio
    ? profileData.bio.split('\n').slice(0, 2).join('\n')
    : null

  const ogImageUrl = `/api/og?${new URLSearchParams({
    title,
    ...(truncatedBio ? { description: truncatedBio } : { description }),
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
