'use client'

import { useQuery } from '@/utils/api'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import useSWR, { mutate } from 'swr'

interface UserScoreData {
  userId: string
  timeframe: string
  score: number
  rank: number | null
  percentile: number
  recentActions: Array<{
    action: string
    score: number
    metadata: Record<string, any>
    timestamp: string
  }>
  achievements: string[]
  streaks: {
    trading: number
    lastTradeDate: string | null
  }
}

interface UseUserScoreOptions {
  userId?: string
  timeframe?: 'lifetime' | 'daily' | 'weekly' | 'monthly'
  skip?: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useUserScore({
  userId,
  timeframe = 'lifetime',
  skip = false,
}: UseUserScoreOptions = {}) {
  const { mainProfile } = useCurrentWallet()
  const targetUserId = userId || mainProfile?.username

  const { data, error, isLoading } = useSWR<UserScoreData>(
    targetUserId && !skip
      ? `/api/scores/${targetUserId}?timeframe=${timeframe}`
      : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  return {
    score: data?.score || 0,
    rank: data?.rank || null,
    percentile: data?.percentile || 0,
    recentActions: data?.recentActions || [],
    achievements: data?.achievements || [],
    streaks: data?.streaks || { trading: 0, lastTradeDate: null },
    loading: isLoading,
    error,
  }
}

interface LeaderboardEntry {
  userId: string
  username?: string
  score: number
  rank: number
  profileImage?: string | null
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  timeframe: string
  category?: string
  limit: number
  offset: number
  total: number
}

interface UseLeaderboardOptions {
  timeframe?: 'lifetime' | 'daily' | 'weekly' | 'monthly'
  category?:
    | 'trading'
    | 'copying'
    | 'influence'
    | 'staking'
    | 'social'
    | 'milestone'
    | 'daily'
  limit?: number
  offset?: number
}

export function useScoreLeaderboard({
  timeframe = 'lifetime',
  category,
  limit = 100,
  offset = 0,
}: UseLeaderboardOptions = {}) {
  const { data, error, loading, refetch } = useQuery<LeaderboardData>({
    endpoint: 'scores/leaderboard',
    queryParams: {
      timeframe,
      ...(category && { category }),
      limit,
      offset,
    },
  })

  return {
    leaderboard: data?.leaderboard || [],
    total: data?.total || 0,
    loading,
    error,
    refetch,
  }
}

// Global function to refresh user scores after actions like trading
export function refreshUserScores(userId: string) {
  // Invalidate all timeframe queries for this user
  mutate((key) => {
    return typeof key === 'string' && key.includes(`/api/scores/${userId}`)
  })
}
