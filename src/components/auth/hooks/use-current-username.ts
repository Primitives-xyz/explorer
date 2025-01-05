'use client'

import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { useUserWallets } from '@dynamic-labs/sdk-react-core'
import { useMemo } from 'react'

export function useCurrentUsername() {
  const userWallets = useUserWallets()

  const walletAddress = useMemo(
    () => userWallets[0]?.address || '',
    [userWallets],
  )
  const { profiles, loading } = useGetProfiles(walletAddress)
  const mainUsername = profiles?.[0]?.profile?.username

  return {
    mainUsername,
    loadingMainUsername: loading,
  }
}
