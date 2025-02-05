import type { Metadata } from 'next'
import { getProfileImage } from '@/utils/profile'

/**
 * Generates metadata for a profile
 */
export async function generateProfileMetadata(
  username: string,
): Promise<Metadata> {
  const title = `@${username} | Explorer`
  const description = `Follow @${username} on Explorer to see their activity on Solana`
  const profileImage = await getProfileImage(username)
  const ogImageUrl = `/api/og?title=${encodeURIComponent(
    title,
  )}&description=${encodeURIComponent(description)}${
    profileImage ? `&image=${encodeURIComponent(profileImage)}` : ''
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
