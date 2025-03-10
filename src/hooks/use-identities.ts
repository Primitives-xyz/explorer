import { isValidSolanaAddress } from '@/utils/validation'
import useSWR, { mutate } from 'swr'

export interface Identity {
  profile: {
    id: string
    created_at: string
    namespace: string
    username: string
    bio: string | null
    image: string | null
  }
  wallet: {
    address: string
  }
  namespace: {
    name: string
    readableName: string
    userProfileURL: string
    faviconURL: string | null
  }
}

interface IdentitiesResponse {
  profiles: Identity[]
}

export const useIdentities = (walletAddress: string, namespace?: string) => {
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
    const data = (await res.json()) as IdentitiesResponse
    return data.profiles
  }
  let queryCondition = `walletAddress=${walletAddress}`

  if(namespace === 'x' || namespace === 'X') { 
    queryCondition += `&ContactType=TWITTER`
  }

  const key = walletAddress
  ? `/api/identities?${queryCondition}`
  : null
  
  console.log("🚀 ~ useIdentities ~ key:", key)
  const {
    data: identities,
    error,
    isLoading,
    mutate: mutateIdentities,
  } = useSWR<Identity[], Error>(key, fetcher, {
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
