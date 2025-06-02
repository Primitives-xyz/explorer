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
  })

  return {
    data,
    error,
    loading,
    refetch,
  }
}
