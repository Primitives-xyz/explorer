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
  const hasProfile = profiles?.length > 0
  const mainUsername = profiles?.[0]?.profile?.username

  return {
    walletAddress,
    mainUsername,
    hasProfile,
    loadingProfiles,
    isLoggedIn,
    sdkHasLoaded,
  }
}
