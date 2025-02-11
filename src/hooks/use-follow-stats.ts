import type { IProfileResponse } from '@/models/profile.models'
import useSWR from 'swr'

async function fetchProfile(url: string): Promise<IProfileResponse | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      if (res.status === 404) {
        // Return null for not found profiles without logging
        return null
      }
      // Don't parse error data or log errors for non-404 responses
      // Just return null to handle gracefully
      return null
    }
    return await res.json()
  } catch (error) {
    // Return null for any fetch errors without logging
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
      shouldRetryOnError: false, // Prevent retries on error
    }
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
