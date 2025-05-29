'use client'

import { useMutation } from '@/utils/api'

export const useUnfollowWallet = () => {
  const {
    mutate: unfollowWallet,
    loading,
    error,
    data,
  } = useMutation<
    null,
    {
      followerUsername: string
      followeeUsername: string
    }
  >({
    endpoint: 'followers/remove',
  })

  return {
    unfollowWallet,
    loading,
    error,
    data,
  }
}
