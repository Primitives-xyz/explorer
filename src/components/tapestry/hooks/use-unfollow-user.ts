'use client'

import { useMutation } from '@/utils/api'

export const useUnfollowUser = () => {
  const {
    mutate: unfollowUser,
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
    unfollowUser,
    loading,
    error,
    data,
  }
}
