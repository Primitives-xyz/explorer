'use client'

import { SolidScoreResponse } from '@/components/tapestry/models/solid.score.models'
import { useQuery } from '@/utils/api'

interface Props {
  id?: string
}

export function useSolidScore({ id }: Props) {
  const { data, error, loading, refetch } = useQuery<SolidScoreResponse>({
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
