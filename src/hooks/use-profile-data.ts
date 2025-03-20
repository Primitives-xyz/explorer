import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { useMemo } from 'react'
import useSWR from 'swr'

export interface ProfileData {
  walletAddress: string
  socialCounts?: {
    followers: number
    following: number
  }
  profile: {
    created_at: string
    image: string | null
    bio?: string
  }
  namespace?: {
    name?: string
    userProfileURL?: string
  }
}

// Simple fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 500) {
    window.location.href = '/'
    throw new Error('Server error')
  }
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export function useProfileData(
  username?: string,
  mainUsername?: string | null,
  namespace?: string | null,
  walletAddress?: string
) {
  // Determine if we have a namespace
  const hasNamespace =
    namespace !== undefined && namespace !== null && namespace !== ''

  // Create API URL based on parameters
  const url = !hasNamespace
    ? `/api/profiles/${username}?fromUsername=${mainUsername}`
    : `/api/profiles/${username}?namespace=${namespace}`

  // Fetch profile data with SWR
  const { data, isLoading, error } = useSWR<ProfileData>(
    walletAddress ? null : url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }
  )

  // Get wallet address from data or provided directly
  const walletAddressParsed = data?.walletAddress || ''

  // Fetch profiles using the wallet address
  const {
    profiles,
    loading: loadingProfiles,
    error: profilesError,
  } = useGetProfiles(walletAddress ? walletAddress : walletAddressParsed)

  // Find the profile with namespace matching EXPLORER_NAMESPACE
  const explorerProfile = useMemo(() => {
    if (!profiles || profiles.length === 0) return null

    return (
      profiles.find(
        (profile: any) => profile.namespace?.name === EXPLORER_NAMESPACE
      ) || profiles[0]
    ) // Default to first profile if no match found
  }, [profiles])

  // Combine all data into a single return object
  return useMemo(() => {
    const isLoadingData = isLoading || loadingProfiles
    const serverError =
      error?.message === 'Server error' ||
      profilesError?.message?.includes('Server error')
    const walletAddressError =
      profilesError?.message === 'Invalid Solana wallet address'

    return {
      profiles: profiles,
      profileData: explorerProfile,
      isLoading: isLoadingData,
      walletAddressError,
      serverError,
    }
  }, [
    isLoading,
    loadingProfiles,
    profiles,
    explorerProfile,
    error,
    profilesError,
    data,
  ])
}
