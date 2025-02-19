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

export function useFollowStats(username: string, fromUsername: string | null) {
  // Construct URL based on whether fromUsername exists
  const url =
    username && fromUsername
      ? `/api/profiles/${username}?fromUsername=${fromUsername}`
      : username
      ? `/api/profiles/${username}`
      : null

  const { data, error, mutate, isLoading } = useSWR<IProfileResponse | null>(
    // Use an array as the key for better stability
    url ? ['profile', username, fromUsername] : null,
    () => fetchProfile(url!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Increased to 1 minute
      revalidateIfStale: false,
      shouldRetryOnError: false,
      // Add suspense to prevent unnecessary re-renders
      suspense: false,
      // Add a longer staleTime
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
