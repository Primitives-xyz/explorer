import { MagicEdenNFT } from '@/types/nft/magic-eden'
import { magicEdenNFTToNFT } from '@/utils/nft'
import { NFT } from '@/utils/types'
import useSWR, { KeyedMutator } from 'swr'

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch wallet NFTs')
  }
  const data = await response.json()
  return data.map((item: MagicEdenNFT) => magicEdenNFTToNFT(item))
}

export interface UseMagicEdenNFTsResult {
  nfts: NFT[]
  isLoading: boolean
  error: string | null
  mutate: KeyedMutator<NFT[]>
}

/**
 * Hook to fetch NFTs from a Magic Eden wallet address and convert them to our NFT type
 *
 * @param address The wallet address to fetch NFTs for
 * @returns An object containing the wallet address, NFTs, original tokens, loading state, and any error
 */
export function useMagicEdenNFTs(address: string): UseMagicEdenNFTsResult {
  const {
    data: nfts,
    error,
    isLoading,
    mutate,
  } = useSWR<NFT[]>(
    address ? `/api/magiceden/wallet/${address}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000, // 1 second
      revalidateIfStale: true,
      revalidateOnMount: true,
      refreshInterval: 0, // Disable auto-refresh
      shouldRetryOnError: true,
      errorRetryCount: 2,
      keepPreviousData: true,
      isPaused: () => !address,
    }
  )

  return {
    nfts: nfts || [],
    isLoading,
    error: error || null,
    mutate,
  }
}
