'use client'

import { SolidScoreResponse } from '@/components/tapestry/models/solid.score.models'
import { useQuery } from '@/utils/api'

interface Props {
  profileId?: string
}

export function useSolidScore({ profileId }: Props) {
  const { data, error, loading, refetch } = useQuery<SolidScoreResponse>({
    endpoint: `solid-score/${profileId}`,
    skip: !profileId,
  })

  return {
    data,
    error,
    loading,
    refetch,
  }
}
