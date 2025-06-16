'use client'

import { useQuery } from '@/utils/api'
import { useCurrentWallet } from '@/utils/use-current-wallet'

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

export function useUserScore({
  userId,
  timeframe = 'lifetime',
  skip = false
}: UseUserScoreOptions = {}) {
  const { mainProfile } = useCurrentWallet()
  const targetUserId = userId || mainProfile?.id

  const { data, error, loading, refetch } = useQuery<UserScoreData>({
    endpoint: `scores/${targetUserId}`,
    queryParams: { timeframe },
    skip: skip || !targetUserId
  })

  return {
    score: data?.score || 0,
    rank: data?.rank,
    percentile: data?.percentile || 0,
    recentActions: data?.recentActions || [],
    achievements: data?.achievements || [],
    streaks: data?.streaks || { trading: 0, lastTradeDate: null },
    loading,
    error,
    refetch
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
  category?: 'trading' | 'copying' | 'influence' | 'staking' | 'social' | 'milestone' | 'daily'
  limit?: number
  offset?: number
}

export function useScoreLeaderboard({
  timeframe = 'lifetime',
  category,
  limit = 100,
  offset = 0
}: UseLeaderboardOptions = {}) {
  const { data, error, loading, refetch } = useQuery<LeaderboardData>({
    endpoint: 'scores/leaderboard',
    queryParams: {
      timeframe,
      ...(category && { category }),
      limit,
      offset
    }
  })

  return {
    leaderboard: data?.leaderboard || [],
    total: data?.total || 0,
    loading,
    error,
    refetch
  }
}