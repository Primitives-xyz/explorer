'use client'

import {
  FungibleTokenInfo,
  TokenResponse,
} from '@/components/tapestry/models/token.models'
import { useQuery } from '@/utils/api'
import useSWR from 'swr'

const isFungibleToken = (
  data?: TokenResponse | null
): data is TokenResponse & { result: FungibleTokenInfo } => {
  return (
    !!data &&
    (data.result?.interface === 'FungibleToken' ||
      data.result?.interface === 'FungibleAsset')
  )
}

interface JupiterTokenResult {
  symbol?: string
  name?: string
  icon?: string
  decimals?: number
}

const CACHE_DURATION = 120_000

const jupiterFetcher = (url: string): Promise<JupiterTokenResult[]> =>
  fetch(url).then((r) => r.json())

export function useTokenInfo(mint?: string | null) {
  // Primary: Helius DAS (authoritative on-chain data)
  const { data, error, loading } = useQuery<TokenResponse>({
    endpoint: 'token',
    queryParams: mint ? { mint } : undefined,
    skip: !mint,
    config: {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      refreshInterval: CACHE_DURATION,
      keepPreviousData: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      revalidateIfStale: false,
    },
  })

  // Secondary: Jupiter Tokens V2 (faster metadata, covers tokens with trading activity)
  const { data: jupiterResults, isLoading: jupiterLoading } =
    useSWR<JupiterTokenResult[]>(
      mint
        ? `/api/jupiter/tokens/search?query=${encodeURIComponent(mint)}`
        : null,
      jupiterFetcher,
      {
        revalidateOnFocus: false,
        dedupingInterval: CACHE_DURATION,
        keepPreviousData: false,
      }
    )

  const jupiterToken =
    Array.isArray(jupiterResults) && jupiterResults.length > 0
      ? jupiterResults[0]
      : null

  const heliusSymbol = data?.result?.content?.metadata?.symbol
  const heliusName = data?.result?.content?.metadata?.name
  const heliusImage = data?.result?.content?.links?.image
  const heliusDecimals = isFungibleToken(data)
    ? data.result.token_info.decimals
    : undefined

  return {
    data,
    // Not loading once either source has returned data
    loading: loading && jupiterLoading,
    error: error instanceof Error ? error.message : error?.toString(),
    symbol: heliusSymbol || jupiterToken?.symbol,
    name: heliusName || jupiterToken?.name,
    image: heliusImage || jupiterToken?.icon,
    decimals: heliusDecimals ?? jupiterToken?.decimals,
  }
}
