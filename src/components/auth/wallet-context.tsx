import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core'
import { useTranslations } from 'next-intl'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useGetProfiles } from './hooks/use-get-profiles'

interface WalletContextType {
  walletAddress: string
  mainUsername: string
  loadingProfiles: boolean
  isLoggedIn: boolean
  primaryWallet: any
  sdkHasLoaded: boolean
  image: string | null
  profiles: any[]
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { sdkHasLoaded: dynamicSdkHasLoaded, primaryWallet } =
    useDynamicContext()
  const t = useTranslations()
  const isLoggedIn = useIsLoggedIn()
  const userWallets = useUserWallets()

  const [forceSdkLoaded, setForceSdkLoaded] = useState(false)

  // Separate effect for timeout logic
  useEffect(() => {
    if (dynamicSdkHasLoaded) return // Early return if already loaded

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

  const { profiles, loading: loadingProfiles } = useGetProfiles(walletAddress)

  const { mainUsername, image } = useMemo(() => {
    if (!profiles) return { mainUsername: '', image: null }

    const mainProfile = profiles.find(
      (profile: any) => profile.namespace.name === 'nemoapp'
    )?.profile

    return {
      mainUsername: mainProfile?.username || '',
      image: mainProfile?.image || null,
    }
  }, [profiles])

  // Memoize the context value to prevent unnecessary rerenders of consumers
  const value = useMemo(
    () => ({
      walletAddress,
      mainUsername,
      loadingProfiles,
      isLoggedIn,
      primaryWallet,
      sdkHasLoaded,
      image,
      profiles: profiles || [],
    }),
    [
      walletAddress,
      mainUsername,
      loadingProfiles,
      isLoggedIn,
      primaryWallet,
      sdkHasLoaded,
      image,
      profiles,
    ]
  )

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletContextProvider')
  }
  return context
}
