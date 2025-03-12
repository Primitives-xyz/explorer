import { IPaginatedResponse, IProfile } from '@/types/profile.types'
import useSWR from 'swr'

interface GetFollowingResponse extends IPaginatedResponse {
  profiles: IProfile[]
}

export function useGetFollowing(username: string) {
  const { data, error } = useSWR<GetFollowingResponse>(
    username ? `/api/profiles/${username}/following` : null,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch following')
      }
      return res.json()
    }
  )

  return {
    following: data,
    loading: !error && !data,
    error,
  }
}
