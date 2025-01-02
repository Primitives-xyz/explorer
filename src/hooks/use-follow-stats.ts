import useSWR from 'swr'

const DEFAULT_STATS = { followers: 0, following: 0 }

async function fetchFollowStats(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch follow stats')
  }
  const data = await res.json()
  return data.profiles?.length || 0
}

export function useFollowStats(username: string) {
  const { data: followers, error: followersError } = useSWR(
    username ? `/api/profiles/${username}/followers` : null,
    fetchFollowStats,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      fallbackData: 0,
    },
  )

  const { data: following, error: followingError } = useSWR(
    username ? `/api/profiles/${username}/following` : null,
    fetchFollowStats,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      fallbackData: 0,
    },
  )

  return {
    stats: {
      followers: followers || 0,
      following: following || 0,
    },
    error: followersError || followingError,
  }
}
