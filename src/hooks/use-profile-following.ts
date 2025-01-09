import useSWR from 'swr'
import { IGetSocialResponse } from '@/models/profile.models'

async function fetchFollowing(url: string): Promise<IGetSocialResponse> {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch following')
  }
  return await res.json()
}

export function useProfileFollowing(username: string | null) {
  console.log('calling API with username', username)
  const { data, error, mutate } = useSWR<IGetSocialResponse>(
    username ? `/api/profiles/${username}/following` : null,
    fetchFollowing,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      revalidateIfStale: false,
      fallbackData: { profiles: [], page: 1, pageSize: 10 },
    },
  )
  console.log('data', data)
  return {
    following: data?.profiles || [],
    count: data?.profiles?.length || 0,
    isLoading: !error && !data,
    error,
    mutate,
  }
}
