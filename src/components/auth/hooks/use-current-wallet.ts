'use client'

import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import {
  useDynamicContext,
  useUserWallets,
  useIsLoggedIn,
} from '@dynamic-labs/sdk-react-core'
import { useMemo } from 'react'

export function useCurrentWallet() {
  const { sdkHasLoaded } = useDynamicContext()
  const isLoggedIn = useIsLoggedIn()
  const userWallets = useUserWallets()
  // Basic wallet state
  const walletAddress = useMemo(
    () => (sdkHasLoaded && isLoggedIn ? userWallets[0]?.address || '' : ''),
    [userWallets, sdkHasLoaded, isLoggedIn],
  )
  const { profiles, loading: loadingProfiles } = useGetProfiles(walletAddress)

  const mainUsername = useMemo(() => {
    if (!profiles) return ''
    return (
      profiles.find((profile: any) => profile.namespace.name === 'nemoapp')
        ?.profile?.username || ''
    )
  }, [profiles])

  if (!isLoggedIn || !sdkHasLoaded || !walletAddress || loadingProfiles)
    return {
      walletAddress: '',
      mainUsername: '',
      loadingProfiles: false,
      isLoggedIn: false,
      sdkHasLoaded: false,
      profiles: [],
    }

  return {
    walletAddress,
    mainUsername,
    loadingProfiles,
    profiles,
    isLoggedIn,
    sdkHasLoaded,
  }
}
