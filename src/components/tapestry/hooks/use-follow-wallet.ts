'use client'

import { useMutation } from '@/utils/api'

export const useFollowWallet = () => {
  const {
    mutate: followWallet,
    loading,
    error,
    data,
  } = useMutation<
    null,
    {
      followerUsername: string
      walletToFollow: string
    }
  >({
    endpoint: 'followers/follow-wallet',
  })

  return {
    followWallet,
    loading,
    error,
    data,
  }
}
