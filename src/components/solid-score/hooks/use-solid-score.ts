'use client'

import { ISolidScoreResponse } from '@/components/tapestry/models/solid.score.models'
import { useQuery } from '@/utils/api'

interface Props {
  profileId?: string
}

export function useSolidScore({ profileId }: Props) {
  const { data, error, loading, refetch } = useQuery<ISolidScoreResponse>({
    endpoint: `solid-score/${profileId}`,
    skip: !profileId,
    // Optimize caching for solid score which doesn't change often
    config: {
      // Cache for 10 minutes
      refreshInterval: 10 * 60 * 1000,
      // Don't refetch on focus
      revalidateOnFocus: false,
      // Keep stale data
      keepPreviousData: true,
      // Dedupe requests within 60 seconds
      dedupingInterval: 60 * 1000,
      // Don't revalidate if data is fresh
      revalidateIfStale: false,
    },
  })

  return {
    data,
    error,
    loading,
    refetch,
  }
}
