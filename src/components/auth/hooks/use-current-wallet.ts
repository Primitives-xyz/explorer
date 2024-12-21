'use client'

import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { useUserWallets } from '@dynamic-labs/sdk-react-core'

interface Profile {
  namespace?: {
    name: string
  }
  profile?: {
    username: string
  }
}

export function useCurrentWallet() {
  const userWallets = useUserWallets()
  const wallet = userWallets[0]
  const walletAddress = wallet?.address

  const { profiles, loading } = useGetProfiles(walletAddress || '')

  const mainUsername = profiles?.[0]?.profile?.username

  const hasProfile = profiles?.length > 0

  return {
    walletIsConnected: !!walletAddress,
    wallet,
    walletAddress,
    mainUsername,
    loadingMainUsername: loading,
    hasProfile,
    profiles,
  }
}
