import { useQuery } from '@/utils/api'
import { useMemo } from 'react'
import { SEARCH_RESULTS_LIMIT } from '../../search/components/search-button'
import { ISearchTokensResponse } from '../birdeye-tokens-search.models'

interface Props {
  query: string
}

export function useGetSearchTokens({ query = '' }: Props) {
  const { data, loading, error } = useQuery<ISearchTokensResponse>({
    endpoint: 'https://public-api.birdeye.so/defi/v3/search',
    queryParams: {
      chain: 'solana',
      keyword: encodeURIComponent(query),
      target: 'token',
      sort_by: 'marketcap',
      sort_type: 'desc',
      verify_token: true,
      offset: 0,
      limit: SEARCH_RESULTS_LIMIT,
    },
    headers: {
      'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY!,
    },
    skip: query.length <= 2,
    toBackend: false,
  })

  const tokens = useMemo(() => {
    return data?.data?.items?.[0]?.result.filter(
      (item) => item.symbol && item.name && item.decimals
    )
  }, [data])

  return {
    tokens: tokens ?? [],
    loading,
    error,
  }
}
