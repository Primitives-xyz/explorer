import useSWR from 'swr'

interface Wallet {
  id: string
  blockchain: string
}

interface Profile {
  id: string
  created_at: number
  namespace: string
  username: string
  bio: string | null
  image: string | null
  wallet: Wallet | null
}

interface GetFollowingResponse {
  profiles: Profile[]
  page: number
  pageSize: number
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
    },
  )

  return {
    following: data,
    loading: !error && !data,
    error,
  }
}
