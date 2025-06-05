'use client'

import { ISolidScoreLeaderboardResponse } from '@/components/tapestry/models/solid.score.models'
import { useQuery } from '@/utils/api'

export function useSolidScoreLeaderboard() {
  const { data, error, loading, refetch } = useQuery<
    ISolidScoreLeaderboardResponse[]
  >({
    endpoint: 'solid-score/leaderboard',
  })

  return {
    data,
    error,
    loading,
    refetch,
  }
}
