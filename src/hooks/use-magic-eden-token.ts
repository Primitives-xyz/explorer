import { MagicEdenNFT } from '@/types/nft/magic-eden'
import useSWR, { KeyedMutator } from 'swr'

interface UseMagicEdenTokenResult {
  token: MagicEdenNFT | null
  isLoading: boolean
  error: Error | null
  mutate: KeyedMutator<MagicEdenNFT>
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch token metadata')
  }
  return response.json()
}

/**
 * Hook to fetch token metadata from Magic Eden by mint address
 *
 * @param mintAddress The mint address of the token to fetch metadata for
 * @returns An object containing the token metadata, loading state, error, and mutate function for manual revalidation
 */
export function useMagicEdenToken(
  mintAddress: string
): UseMagicEdenTokenResult {
  const { data, error, isLoading, mutate } = useSWR<MagicEdenNFT>(
    mintAddress ? `/api/magiceden/token/${mintAddress}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      revalidateOnMount: true,
      refreshInterval: 0, // Disable auto-refresh
      shouldRetryOnError: true,
      errorRetryCount: 2,
      keepPreviousData: true,
      isPaused: () => !mintAddress,
    }
  )

  return {
    token: data || null,
    isLoading,
    error: error || null,
    mutate,
  }
}
