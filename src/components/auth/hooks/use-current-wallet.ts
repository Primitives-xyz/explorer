'use client'

import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { useUserWallets } from '@dynamic-labs/sdk-react-core'

export function useCurrentWallet() {
  const userWallets = useUserWallets()
  const wallet = userWallets[0]
  const walletAddress = wallet?.address

  const { profiles, loading } = useGetProfiles(walletAddress || '')

  const mainUsername =
    profiles?.[0]?.namespace?.name === 'nemoapp'
      ? profiles[0]?.profile?.username
      : undefined

  return {
    walletIsConnected: !!walletAddress,
    wallet,
    walletAddress,
    mainUsername,
    loadingMainUsername: loading,
  }
}
