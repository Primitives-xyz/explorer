import useSWR, { mutate } from 'swr'
import { isValidSolanaAddress } from '@/utils/validation'

export const useGetProfiles = (
  walletAddress: string,
  useIdentities: boolean = false,
) => {
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
    ? `/api/profiles?walletAddress=${walletAddress}&useIdentities=${useIdentities}`
    : null

  const {
    data: profiles,
    error,
    isLoading,
    mutate: mutateProfiles,
  } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    revalidateIfStale: false,
    refreshInterval: 0,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    keepPreviousData: true,
    fallbackData: null,
    isPaused: () => !walletAddress,
  })

  return { profiles, loading: isLoading, error, mutateProfiles }
}

// Export a function to manually trigger revalidation
export const refreshProfiles = (
  walletAddress: string,
  useIdentities: boolean = false,
) => {
  return mutate(
    `/api/profiles?walletAddress=${walletAddress}&useIdentities=${useIdentities}`,
  )
}
