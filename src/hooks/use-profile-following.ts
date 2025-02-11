import type { IGetSocialResponse } from '@/models/profile.models'
import useSWR from 'swr'

async function fetchFollowing(url: string): Promise<IGetSocialResponse> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch following')
  }
  return res.json()
}

export function useProfileFollowing(username: string | null) {
  const { data, error, mutate } = useSWR<IGetSocialResponse>(
    username ? `/api/profiles/${username}/following` : null,
    fetchFollowing,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      revalidateIfStale: false,
    }
  )

  return {
    following: data?.profiles || [],
    count: data?.profiles?.length || 0,
    isLoading: !error && !data,
    error,
    mutate,
  }
}
