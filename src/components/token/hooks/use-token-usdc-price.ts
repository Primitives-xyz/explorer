import { useQuery } from '@/utils/api'
import { USDC_MINT } from '@/utils/constants'

interface Props {
  tokenMint?: string | null
  decimals?: number
}

export function useTokenUSDCPrice({ tokenMint, decimals }: Props) {
  const shouldFetch = tokenMint && tokenMint !== USDC_MINT
  const amount = Math.pow(10, decimals || 6)

  const { data, loading, error } = useQuery<{ outAmount: string }>({
    endpoint: 'jupiter/quote',
    queryParams: shouldFetch
      ? { inputMint: tokenMint, outputMint: USDC_MINT, amount, slippageBps: 50 }
      : undefined,
    skip: !shouldFetch,
    config: {
      refreshInterval: 60000,
      dedupingInterval: 10000,
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  })

  const hasValidResponse = data && data.outAmount && !error
  const processedPrice = hasValidResponse
    ? Number(data.outAmount) / Math.pow(10, 6)
    : null
  const isValidPrice =
    processedPrice !== null && !isNaN(processedPrice) && processedPrice > 0

  if (tokenMint === USDC_MINT) {
    return { price: 1, loading: false, error: null }
  }

  return {
    price: isValidPrice ? processedPrice : null,
    loading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch token price'
      : null,
  }
}
