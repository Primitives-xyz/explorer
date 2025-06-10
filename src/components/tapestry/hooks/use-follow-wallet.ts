'use client'

import { useMutation } from '@/utils/api'

interface FollowWalletResponse {
  transaction: string
  usernameToFollow: string
  message: string
}

interface FollowWalletRequest {
  followerUsername: string
  walletToFollow: string
  followerWallet: string
  namespace?: string
  type?: 'follow' | 'unfollow'
}

export const useFollowWallet = () => {
  const {
    mutate: followWallet,
    loading,
    error,
    data,
  } = useMutation<FollowWalletResponse, FollowWalletRequest>({
    endpoint: 'followers/follow-wallet',
  })

  return {
    followWallet,
    loading,
    error,
    data,
  }
}
