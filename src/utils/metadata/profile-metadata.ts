import { getProfileMetadata } from '@/utils/profile'
import type { Metadata } from 'next'
export interface ProfileMetadata {
  image: string | null
  bio: string | null
  socialCounts: {
    followers: number
    following: number
  }
  walletAddress: string
}
  
/**
 * Generates metadata for a profile
 */
export async function generateProfileMetadata(
  username: string,
  profileDataParam?: ProfileMetadata | null
): Promise<Metadata> {
  let profileData;

  if(profileDataParam) {
    profileData = profileDataParam;
  } else {
    profileData = await getProfileMetadata(username)
  }
  const title = `@${username}`
  const description = `Follow @${username} on Explorer`

  const ogImageUrl = `/api/og?${new URLSearchParams({
    title,
    description,
    ...(profileData?.bio ? { bio: profileData.bio } : {}),
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
