import useSWR from 'swr'
import { IProfileResponse } from '@/models/profile.models'

async function fetchProfile(url: string): Promise<IProfileResponse> {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch profile')
  }
  return await res.json()
}

export function useFollowStats(username: string, fromUsername: string) {
  // only add fromusername if it exist
  const url =
    username && fromUsername
      ? `/api/profiles/${username}?fromUsername=${fromUsername}`
      : null

  const { data, error } = useSWR<IProfileResponse>(url, fetchProfile, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30000, // 30 seconds
    revalidateIfStale: false,
  })

  return {
    stats: {
      followers: data?.socialCounts?.followers || 0,
      following: data?.socialCounts?.following || 0,
      isFollowing: data?.isFollowing || false,
    },
    error,
  }
}
