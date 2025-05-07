import { IGetTrendingTokensWithHoldersResponse } from '@/components/discover/models/trending-tokens.models'
import { useQuery } from '@/utils/api'

export const useGetTrendingTokensWithHolders = () => {
  const { data, loading, error, refetch } =
    useQuery<IGetTrendingTokensWithHoldersResponse>({
      endpoint: 'trending-with-holders',
    })

  return {
    tokens: data?.data?.tokens ?? [],
    loading,
    error,
    refetch,
  }
}
