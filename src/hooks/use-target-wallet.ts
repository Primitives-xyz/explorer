import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useMemo } from 'react'
import { useProfileData } from './use-profile-data'

export function useTargetWallet(username: string, namespace?: string) {
  const { mainUsername } = useCurrentWallet()
  const { profileData, isLoading, walletAddressError, serverError } =
    useProfileData(username, mainUsername, namespace)

  return useMemo(
    () => ({
      targetWalletAddress: profileData?.walletAddress || '',
      isLoading,
      walletAddressError,
      serverError,
      isOwnWallet: mainUsername === username,
    }),
    [
      profileData?.walletAddress,
      isLoading,
      walletAddressError,
      serverError,
      mainUsername,
      username,
    ]
  )
}
