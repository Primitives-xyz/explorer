import type { FungibleTokenInfo, TokenResponse } from '@/types/Token'
import { useTranslations } from 'next-intl'
import useSWR from 'swr'

// Helper function to check if token is fungible
const isFungibleToken = (
  data: TokenResponse | null | undefined
): data is TokenResponse & { result: FungibleTokenInfo } => {
  return (
    !!data &&
    (data.result?.interface === 'FungibleToken' ||
      data.result?.interface === 'FungibleAsset')
  )
}

const CACHE_DURATION = 120_000 // Increased from 30s to 120s (2 minutes)

export function useTokenInfo(mint?: string | null) {
  const t = useTranslations()

  const fetcher = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(t('error.failed_to_fetch_token_info'))
    }
    return response.json()
  }

  const { data, error, isLoading } = useSWR<TokenResponse>(
    mint ? `/api/token?mint=${mint}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      refreshInterval: CACHE_DURATION,
      keepPreviousData: true,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      revalidateIfStale: false, // Don't revalidate if data is stale
    }
  )

  return {
    data,
    loading: isLoading,
    error: error instanceof Error ? error.message : error?.toString(),
    // Helper getters for commonly used data
    symbol: data?.result?.content?.metadata?.symbol,
    name: data?.result?.content?.metadata?.name,
    image: data?.result?.content?.links?.image,
    decimals: isFungibleToken(data)
      ? data.result.token_info.decimals
      : undefined,
  }
}
