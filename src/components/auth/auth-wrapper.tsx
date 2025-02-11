'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useEffect, useRef } from 'react'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { sdkHasLoaded, isLoggedIn, walletAddress } = useCurrentWallet()
  const hasInitialized = useRef(false)

  // Single initialization point for holder check
  useEffect(() => {
    if (
      !hasInitialized.current &&
      sdkHasLoaded &&
      isLoggedIn &&
      walletAddress
    ) {
      hasInitialized.current = true
    }
  }, [sdkHasLoaded, isLoggedIn, walletAddress])

  // Reset initialization flag when wallet disconnects
  useEffect(() => {
    if (!walletAddress || !isLoggedIn || !sdkHasLoaded) {
      hasInitialized.current = false
    }
  }, [walletAddress, isLoggedIn, sdkHasLoaded])

  return <>{children}</>
}
