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
  console.log(
    'profiles',
    profiles?.filter((profile: any) => profile.namespace.name === 'nemoapp'),
  )
  const mainUsername = profiles?.filter(
    (profile: any) => profile.namespace.name === 'nemoapp',
  )[0]?.profile?.username
  console.log('mainUsername', mainUsername)
  return {
    walletAddress,
    mainUsername,
    hasProfile: !!mainUsername,
    loadingProfiles,
    isLoggedIn,
    sdkHasLoaded,
  }
}
