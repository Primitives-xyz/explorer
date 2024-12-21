import { IGetSocialResponse } from '@/models/profile.models'
import useSWR from 'swr'

export const useGetFollowing = (username: string) => {
  const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to fetch following')
    }
    return await res.json()
  }

  const {
    data: following,
    error,
    isLoading: loading,
    mutate,
  } = useSWR<IGetSocialResponse>(
    username ? `/api/profiles/${username}/following` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    },
  )

  return { following, loading, error, mutate }
}
