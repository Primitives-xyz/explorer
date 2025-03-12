import {
  IGetProfileResponse,
  IProfilesListResponse,
} from '@/types/profile.types'
import { X_NAMESPACE } from '@/utils/constants'
import { isValidSolanaAddress } from '@/utils/validation'
import useSWR, { mutate } from 'swr'

export const useIdentities = (walletAddress: string, namespace?: string) => {
  const fetcher = async (url: string) => {
    // Validate wallet address before making the API call
    if (
      namespace !== X_NAMESPACE &&
      walletAddress &&
      !isValidSolanaAddress(walletAddress)
    ) {
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

  let queryCondition = `walletAddress=${walletAddress}`
  if (namespace === X_NAMESPACE) {
    queryCondition += `&contactType=TWITTER&useIdentities=true`
  }

  const key = walletAddress ? `/api/identities?${queryCondition}` : null

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
export const refreshIdentities = (
  walletAddress: string,
  namespace?: string
) => {
  let queryCondition = `/api/identities?walletAddress=${walletAddress}`
  if (namespace === X_NAMESPACE) {
    queryCondition += `&contactType=TWITTER&useIdentities=true`
  }

  return mutate(`${queryCondition}`)
}
