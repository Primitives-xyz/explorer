import { isValidSolanaAddress } from '@/utils/validation'
import useSWR, { mutate } from 'swr'

export const useGetProfiles = (walletAddress: string) => {
  const fetcher = async (url: string) => {
    // Validate wallet address before making the API call
    if (walletAddress && !isValidSolanaAddress(walletAddress)) {
      throw new Error('Invalid Solana wallet address')
    }

    const res = await fetch(url)
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to fetch profiles')
    }
    const data = await res.json()
    return data.profiles
  }

  const key = walletAddress
    ? `/api/profiles?walletAddress=${walletAddress}`
    : null

  const {
    data: profiles,
    error,
    isLoading,
    mutate: mutateProfiles,
  } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000, // 5 seconds
    revalidateIfStale: true,
    revalidateOnMount: true,
    refreshInterval: 30000, // 30 seconds
    shouldRetryOnError: true,
    errorRetryCount: 2,
    keepPreviousData: true,
    isPaused: () => !walletAddress,
  })

  return { profiles, loading: isLoading, error, mutateProfiles }
}

// Export a function to manually trigger revalidation
export const refreshProfiles = (walletAddress: string) => {
  return mutate(`/api/profiles?walletAddress=${walletAddress}`)
}
