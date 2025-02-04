import useSWR from 'swr'
import { IProfileResponse } from '@/models/profile.models'

async function fetchProfile(url: string): Promise<IProfileResponse | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      if (res.status === 404) {
        // Return null for not found profiles without logging
        return null
      }
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to fetch profile')
    }
    return await res.json()
  } catch (error) {
    // Only log non-404 errors
    if (error instanceof Error && !error.message.includes('404')) {
      console.error('Error fetching profile:', error)
    }
    return null
  }
}

export function useFollowStats(username: string, fromUsername: string) {
  // Construct URL based on whether fromUsername exists
  const url = username
    ? fromUsername
      ? `/api/profiles/${username}?fromUsername=${fromUsername}`
      : `/api/profiles/${username}`
    : null

  const { data, error, mutate, isLoading } = useSWR<IProfileResponse | null>(
    url,
    fetchProfile,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      revalidateIfStale: false,
    },
  )

  return {
    stats: {
      followers: data?.socialCounts?.followers || 0,
      following: data?.socialCounts?.following || 0,
      isFollowing: data?.isFollowing ?? false,
    },
    isLoading,
    error,
    mutate,
  }
}
