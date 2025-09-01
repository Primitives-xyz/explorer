import { useQuery } from '@/utils/api'
import { useMemo } from 'react'

/**
 * useTokenPriceV3
 * Fetches price data from our Jupiter Price API v3 proxy for up to 50 mints.
 * IMPORTANT: This hook DOES NOT batch internally. If you need to fetch more
 * than 50 mints, perform batching outside of this hook and call it per chunk.
 *
 * Docs: https://dev.jup.ag/docs/price-api/v3
 */
export function useTokenPriceV3({
  mints,
  refreshIntervalMs = 60000,
  skip = false,
}: {
  mints: string[]
  refreshIntervalMs?: number
  skip?: boolean
}) {
  const ids = useMemo(() => {
    // Deduplicate and drop falsy values
    const unique = Array.from(new Set(mints.filter(Boolean)))
    // Enforce 50-id limit at the hook level; batching must happen above
    return unique.slice(0, 50)
  }, [mints])

  const idsParam = ids.join(',')

  const { data, loading, error, refetch } = useQuery<
    Record<
      string,
      {
        usdPrice: number
        priceChange24h?: number
        blockId?: number
        decimals?: number
      }
    >
  >({
    endpoint: 'jupiter/price-v3',
    queryParams: idsParam ? { ids: idsParam } : undefined,
    skip: skip || !idsParam,
    config: {
      refreshInterval: refreshIntervalMs,
      dedupingInterval: 10000,
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  })
  console.log('v3Data', data)
  return {
    data,
    loading,
    error,
    refetch,
    idsUsed: ids,
  }
}
