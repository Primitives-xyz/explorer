import { IGetProfileResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { useMemo } from 'react'

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

  const {
    data,
    loading: isLoading,
    error,
  } = useQuery<IGetProfileResponse>({
    endpoint: url,
    skip: !!walletAddress,
    config: {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    },
  })

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
