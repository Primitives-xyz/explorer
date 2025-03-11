import {
  IGetProfileResponse,
  IProfilesListResponse,
} from '@/types/profile.types'
import { isValidSolanaAddress } from '@/utils/validation'
import useSWR, { mutate } from 'swr'

export const useIdentities = (walletAddress: string) => {
  const fetcher = async (url: string) => {
    // Validate wallet address before making the API call
    if (walletAddress && !isValidSolanaAddress(walletAddress)) {
      throw new Error('Invalid Solana wallet address')
    }

    const res = await fetch(url)
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to fetch identities')
    }
    const data = (await res.json()) as IProfilesListResponse
    return data.profiles
  }

  const key = walletAddress
    ? `/api/identities?walletAddress=${walletAddress}`
    : null

  const {
    data: identities,
    error,
    isLoading,
    mutate: mutateIdentities,
  } = useSWR<IGetProfileResponse[], Error>(key, fetcher, {
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

  return {
    identities,
    loading: isLoading,
    error,
    mutateIdentities,
  }
}

// Export a function to manually trigger revalidation
export const refreshIdentities = (walletAddress: string) => {
  return mutate(`/api/identities?walletAddress=${walletAddress}`)
}
