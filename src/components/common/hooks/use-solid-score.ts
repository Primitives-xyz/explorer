'use client'

import { SolidScoreResponse } from '@/components/tapestry/models/solid.score.models'
import { useQuery } from '@/utils/api'

interface Props {
  walletAddress?: string
}

export function useSolidScore({ walletAddress }: Props) {
  const shouldFetch = !!walletAddress

  const { data, error, loading, refetch } = useQuery<SolidScoreResponse>({
    endpoint: `/solid-score/${walletAddress}`,
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
