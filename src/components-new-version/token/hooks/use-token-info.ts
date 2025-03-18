import {
  FungibleTokenInfo,
  TokenResponse,
} from '@/components-new-version/models/token.models'
import { useQuery } from '@/components-new-version/utils/api'

const isFungibleToken = (
  data: TokenResponse | null | undefined
): data is TokenResponse & { result: FungibleTokenInfo } => {
  return (
    !!data &&
    (data.result?.interface === 'FungibleToken' ||
      data.result?.interface === 'FungibleAsset')
  )
}

const CACHE_DURATION = 120_000

export function useTokenInfo(mint?: string | null) {
  const { data, error, loading } = useQuery<TokenResponse>({
    endpoint: 'token',
    queryParams: mint ? { mint } : undefined,
    skip: !mint,
    config: {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      refreshInterval: CACHE_DURATION,
      keepPreviousData: true,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      revalidateIfStale: false,
    },
  })

  return {
    data,
    loading,
    error: error instanceof Error ? error.message : error?.toString(),
    symbol: data?.result?.content?.metadata?.symbol,
    name: data?.result?.content?.metadata?.name,
    image: data?.result?.content?.links?.image,
    decimals: isFungibleToken(data)
      ? data.result.token_info.decimals
      : undefined,
  }
}
