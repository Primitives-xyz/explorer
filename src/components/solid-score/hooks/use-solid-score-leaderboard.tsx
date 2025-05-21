'use client'

import { SolidScoreLeaderboardResponse } from '@/components/tapestry/models/solid.score.models'
import { useQuery } from '@/utils/api'

export function useSolidScoreLeaderboard() {
  const { data, error, loading, refetch } = useQuery<
    SolidScoreLeaderboardResponse[]
  >({
    endpoint: `solid-score/leaderboard`,
    toBackend: true,
  })

  return {
    data,
    error,
    loading,
    refetch,
  }
}
