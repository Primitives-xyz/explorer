'use client'

import { SolidScoreResponse } from '@/components/tapestry/models/solid.score.models'
import { useQuery } from '@/utils/api'

interface Props {
  id?: string
}

export function useSolidScore({ id }: Props) {
  const shouldFetch = !!id

  const { data, error, loading, refetch } = useQuery<SolidScoreResponse>({
    endpoint: `solid-score/${id}`,
    skip: !shouldFetch,
    toBackend: true,
  })

  return {
    data,
    error,
    loading,
    refetch,
  }
}
