import { IProfile } from '@/types/profile.types'
import useSWR from 'swr'

interface GetFollowingResponse {
  profiles: IProfile[]
  page: number
  pageSize: number
}

export function useGetFollowers(username: string) {
  const { data, error } = useSWR<GetFollowingResponse>(
    username ? `/api/profiles/${username}/followers` : null,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch following')
      }
      return res.json()
    }
  )

  return {
    followers: data,
    loading: !error && !data,
    error,
  }
}
