import { isValidSolanaAddress } from '@/utils/validation'
import useSWR, { mutate } from 'swr'

export const useGetProfiles = (
  walletAddress: string,
  useIdentities: boolean = false
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

  const endpoint = useIdentities ? '/api/identity' : '/api/profiles'
  const key = walletAddress
    ? `${endpoint}?walletAddress=${walletAddress}`
    : null

  const {
    data: profiles,
    error,
    isLoading,
    mutate: mutateProfiles,
  } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
    revalidateIfStale: true,
    revalidateOnMount: true,
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
  useIdentities: boolean = false
) => {
  const endpoint = useIdentities ? '/api/identity' : '/api/profiles'
  return mutate(`${endpoint}?walletAddress=${walletAddress}`)
}
