'use client'

import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core'
import { useEffect, useMemo, useState } from 'react'

export function useCurrentWallet() {
  const { sdkHasLoaded: dynamicSdkHasLoaded, primaryWallet } =
    useDynamicContext()
  const isLoggedIn = useIsLoggedIn()
  const userWallets = useUserWallets()
  const [forceSdkLoaded, setForceSdkLoaded] = useState(false)

  // Add timeout to force sdkHasLoaded after 5 seconds
  useEffect(() => {
    console.log('Dynamic SDK Load Status:', {
      dynamicSdkHasLoaded,
      forceSdkLoaded,
      primaryWallet: !!primaryWallet,
      isLoggedIn,
      userWallets: !!userWallets?.length,
    })

    const timeoutId = setTimeout(() => {
      if (!dynamicSdkHasLoaded) {
        console.warn('SDK load timeout reached, forcing loaded state')
        setForceSdkLoaded(true)
      }
    }, 5000) // 5 second timeout

    return () => {
      clearTimeout(timeoutId)
      console.log('Cleanup: SDK load timeout cleared')
    }
  }, [dynamicSdkHasLoaded, primaryWallet, isLoggedIn, userWallets])

  // Consider SDK loaded if either Dynamic reports it as loaded or we hit the timeout
  const sdkHasLoaded = dynamicSdkHasLoaded || forceSdkLoaded

  // Basic wallet state
  const walletAddress = useMemo(
    () => (sdkHasLoaded && isLoggedIn ? userWallets[0]?.address || '' : ''),
    [userWallets, sdkHasLoaded, isLoggedIn]
  )
  const { profiles, loading: loadingProfiles } = useGetProfiles(walletAddress)

  const mainUsername = useMemo(() => {
    if (!profiles) return ''
    return (
      profiles.find((profile: any) => profile.namespace.name === 'nemoapp')
        ?.profile?.username || ''
    )
  }, [profiles])

  // Return early with proper SDK loaded state
  if (!isLoggedIn || !walletAddress || loadingProfiles) {
    return {
      walletAddress: '',
      mainUsername: '',
      loadingProfiles,
      isLoggedIn,
      sdkHasLoaded, // Keep the actual SDK loaded state
      profiles: [],
      image: null,
    }
  }

  const mainProfile = profiles?.find(
    (profile: any) => profile.namespace.name === 'nemoapp'
  )?.profile
  const image = mainProfile?.image || null

  return {
    walletAddress,
    mainUsername,
    loadingProfiles,
    profiles,
    isLoggedIn,
    primaryWallet,
    sdkHasLoaded,
    image,
  }
}
