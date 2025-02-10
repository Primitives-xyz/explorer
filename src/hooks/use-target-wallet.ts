import { useProfileData } from './use-profile-data'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useMemo } from 'react'

export function useTargetWallet(username: string) {
  const { mainUsername } = useCurrentWallet()
  const { profileData, isLoading, walletAddressError, serverError } =
    useProfileData(username, mainUsername)

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
    ],
  )
}
