import { IGetSocialResponse } from '@/models/profile.models'
import useSWR from 'swr'

export const useGetFollowers = (username: string) => {
  const fetcher = async (url: string) => {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to fetch followers')
    }
    return await res.json()
  }

  const {
    data: followers,
    error,
    isLoading: loading,
    mutate,
  } = useSWR<IGetSocialResponse>(
    username ? `/api/profiles/${username}/followers` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 1000,
      refreshInterval: 3000,
    },
  )

  return { followers, loading, error, mutate }
}
