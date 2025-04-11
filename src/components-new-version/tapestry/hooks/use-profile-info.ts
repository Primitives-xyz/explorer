import { IGetProfileResponse } from '@/components-new-version/models/profiles.models'
import { useGetProfiles } from '@/components-new-version/tapestry/hooks/use-get-profiles'
import { useQuery } from '@/components-new-version/utils/api'
import { EXPLORER_NAMESPACE } from '@/components-new-version/utils/constants'

import { useMemo } from 'react'
interface Props {
  username?: string
  mainUsername?: string
  namespace?: string
  walletAddress?: string
}

export function useProfileInfo({
  username,
  mainUsername,
  namespace,
  walletAddress,
}: Props) {
  const hasNamespace = !!namespace

  // Create API URL based on parameters
  const url = !hasNamespace
    ? `profiles/${username}?fromUsername=${mainUsername}`
    : `profiles/${username}?namespace=${namespace}`

  const {
    data,
    loading: getProfileLoading,
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
  } = useGetProfiles({
    walletAddress: walletAddress ? walletAddress : walletAddressParsed,
  })

  // Find the profile with namespace matching EXPLORER_NAMESPACE
  const explorerProfile = useMemo(() => {
    if (!profiles || profiles.profiles.length === 0) return null

    return (
      profiles.profiles.find(
        (profile) => profile.namespace?.name === EXPLORER_NAMESPACE
      ) || profiles.profiles[0]
    ) // Default to first profile if no match found
  }, [profiles])

  // Combine all data into a single return object
  return useMemo(() => {
    const isLoadingData = getProfileLoading || loadingProfiles
    const serverError =
      error?.message === 'Server error' ||
      profilesError?.message?.includes('Server error')
    const walletAddressError =
      profilesError?.message === 'Invalid Solana wallet address'

    return {
      profiles,
      profileInfo: explorerProfile,
      isLoading: isLoadingData,
      walletAddressError,
      serverError,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getProfileLoading,
    loadingProfiles,
    profiles,
    explorerProfile,
    error,
    profilesError,
    data,
  ])
}
