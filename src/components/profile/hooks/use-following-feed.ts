import { IGetSocialResponse } from '@/types/profile.types'
import type { Transaction } from '@/utils/helius/types'
import useSWR from 'swr'

interface FeedResponse {
  profiles: IGetSocialResponse['profiles']
  transactions: Transaction[]
}

export function useFollowingFeed(username: string) {
  const { data, error } = useSWR<FeedResponse>(
    username ? `/api/profiles/${username}/feed` : null,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch feed')
      }
      return res.json()
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      revalidateIfStale: false,
    }
  )

  return {
    following: data?.profiles ?? [],
    transactions: data?.transactions ?? [],
    loading: !error && !data,
    error,
  }
}
