import type { IGetSocialResponse } from '@/models/profile.models'
import useSWR from 'swr'

async function fetchFollowers(url: string): Promise<IGetSocialResponse> {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch followers')
  }
  return await res.json()
}

export function useProfileFollowers(username: string | null) {
  const { data, error, mutate } = useSWR<IGetSocialResponse>(
    username ? `/api/profiles/${username}/followers` : null,
    fetchFollowers,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      revalidateIfStale: false,
      fallbackData: { profiles: [], page: 1, pageSize: 10 },
    }
  )

  return {
    followers: data?.profiles || [],
    count: data?.profiles?.length || 0,
    isLoading: !error && !data,
    error,
    mutate,
  }
}
