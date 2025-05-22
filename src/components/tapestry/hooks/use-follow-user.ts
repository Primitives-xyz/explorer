'use client'

import { useMutation } from '@/utils/api'

export const useFollowUser = () => {
  const {
    mutate: followUser,
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
    endpoint: 'followers/add',
  })

  return {
    followUser,
    loading,
    error,
    data,
  }
}
