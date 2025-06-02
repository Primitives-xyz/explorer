'use client'

import { ISolidScoreResponse } from '@/components/tapestry/models/solid.score.models'
import { useQuery } from '@/utils/api'

interface Props {
  id?: string
}

export function useSolidScore({ id }: Props) {
  const { data, error, loading, refetch } = useQuery<ISolidScoreResponse>({
    endpoint: `solid-score/${id}`,
    skip: !id,
    toBackend: true,
  })

  return {
    data,
    error,
    loading,
    refetch,
  }
}
