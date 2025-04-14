import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { useGetProfiles } from '../tapestry/hooks/use-get-profiles'
import { EXPLORER_NAMESPACE } from './constants'

export function useCurrentWallet() {
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
  })

  const { mainProfile } = useMemo(() => {
    const mainProfile = profiles?.profiles.find(
      (profile) =>
        profile.namespace.name === EXPLORER_NAMESPACE &&
        profile.wallet.address === walletAddress
    )

    return {
      mainProfile,
    }
  }, [profiles, walletAddress])

  return {
    profiles,
    walletAddress,
    socialCounts: mainProfile?.socialCounts,
    mainProfile: mainProfile?.profile,
    loading: !dynamicSdkHasLoaded || getProfilesLoading,
    isLoggedIn,
    primaryWallet,
    sdkHasLoaded,
    logout: handleLogOut,
    setShowAuthFlow,
    refetch: refetchGetProfiles,
  }
}
