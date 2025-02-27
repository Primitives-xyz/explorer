import type { IGetSocialResponse } from '@/models/profile.models'
import useSWR from 'swr'

async function fetchFollowers(url: string): Promise<IGetSocialResponse> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch followers')
  }
  return res.json()
}

export function useProfileFollowers(username: string | null, namespace?: string | null | undefined) {
  const namespaceQuery = namespace ? `?namespace=${namespace}` : '';  

  const { data, error, mutate } = useSWR<IGetSocialResponse>(
    username ? `/api/profiles/${username}/followers${namespaceQuery}` : null,
    fetchFollowers,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      revalidateIfStale: false
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
