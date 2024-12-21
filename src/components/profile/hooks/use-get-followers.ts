import { IGetSocialResponse } from '@/models/profile.models'
import useSWR from 'swr'

export const useGetFollowers = (username: string) => {
  const fetcher = async (url: string) => {
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
      dedupingInterval: 2000,
    },
  )

  return { followers, loading, error, mutate }
}
