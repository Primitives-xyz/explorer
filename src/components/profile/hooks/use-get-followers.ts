import { IGetSocialResponse } from '@/models/profile.models'
import useSWR from 'swr'

export const useGetFollowers = (username: string) => {
  const fetcher = async (url: string): Promise<IGetSocialResponse> => {
    const res = await fetch(url)
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
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
      revalidateIfStale: false,
    },
  )

  return { followers, loading, error, mutate }
}
