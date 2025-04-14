import type { Metadata } from 'next'
import { fetchTapestryServer } from '../api/tapestry-server'

async function getProfileMetadata(
  username: string
): Promise<ProfileMetadata | null> {
  try {
    const endpoint = `profiles/new/${username}`
    const data = await fetchTapestryServer({
      endpoint,
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
  let profileData

  if (profileDataParam) {
    profileData = profileDataParam
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
