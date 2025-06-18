'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { EXPLORER_NAMESPACE } from './constants'
import { ADMIN_USERS } from './user-permissions'

export interface LoadingStates {
  sdk: boolean
  profiles: boolean
  overall: boolean
}

interface Props {
  refreshInterval?: number
  skip?: boolean
}

export function useCurrentWallet({ refreshInterval, skip }: Props = {}) {
  const {
    sdkHasLoaded: dynamicSdkHasLoaded,
    primaryWallet,
    handleLogOut,
    setShowAuthFlow,
  } = useDynamicContext()
  const t = useTranslations()
  const isLoggedIn = useIsLoggedIn()
  const userWallets = useUserWallets()
  const [forceSdkLoaded, setForceSdkLoaded] = useState(false)

  useEffect(() => {
    if (dynamicSdkHasLoaded) return

    const timeoutId = setTimeout(() => {
      console.warn(t('error.sdk_load_timeout_reached_forcing_loaded_state'))
      setForceSdkLoaded(true)
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [dynamicSdkHasLoaded, t])

  const sdkHasLoaded = useMemo(
    () => dynamicSdkHasLoaded || forceSdkLoaded,
    [dynamicSdkHasLoaded, forceSdkLoaded]
  )

  const walletAddress = useMemo(
    () => (sdkHasLoaded && isLoggedIn ? userWallets?.[0]?.address || '' : ''),
    [userWallets, sdkHasLoaded, isLoggedIn]
  )

  const {
    profiles,
    loading: getProfilesLoading,
    refetch: refetchGetProfiles,
  } = useGetProfiles({
    walletAddress,
    skip: !walletAddress || skip,
    refreshInterval,
  })

  const { mainProfile } = useMemo(() => {
    const mainProfile = profiles?.profiles.find(
      (profile) =>
        profile.namespace.name === EXPLORER_NAMESPACE &&
        profile.wallet?.address === walletAddress
    )

    return {
      mainProfile,
    }
  }, [profiles, walletAddress])

  const isAdmin = !!mainProfile?.profile?.username
    ? ADMIN_USERS.includes(mainProfile.profile.username)
    : false

  const loadingStates: LoadingStates = useMemo(
    () => ({
      sdk: !sdkHasLoaded,
      profiles: !!walletAddress && getProfilesLoading,
      overall: !sdkHasLoaded,
    }),
    [sdkHasLoaded, walletAddress, getProfilesLoading]
  )

  return {
    profiles,
    walletAddress,
    socialCounts: mainProfile?.socialCounts,
    mainProfile: mainProfile?.profile,
    loading: loadingStates.overall,
    loadingStates,
    isLoggedIn,
    primaryWallet,
    sdkHasLoaded,
    isAdmin,
    logout: handleLogOut,
    setShowAuthFlow,
    refetch: refetchGetProfiles,
  }
}
