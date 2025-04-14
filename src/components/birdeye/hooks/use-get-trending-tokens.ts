import { IGetTrendingTokensResponse } from '@/components/birdeye/birdeye-tokens-trending.models'
import { useQuery } from '@/utils/api'

interface Props {
  limit?: number
}

export function useGetTrendingTokens({ limit = 20 }: Props = {}) {
  const { data, loading, error } = useQuery<IGetTrendingTokensResponse>({
    endpoint: 'https://public-api.birdeye.so/defi/token_trending',
    queryParams: {
      sort_by: 'volume24hUSD',
      sort_type: 'desc',
      offset: 0,
      limit,
    },
    headers: {
      'x-chain': 'solana',
      'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY!,
    },
    toBackend: false,
  })

  return {
    tokens: data?.data?.tokens ?? [],
    loading,
    error,
  }
}
