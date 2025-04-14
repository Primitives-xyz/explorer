'use client'

import { useMutation } from '@/components/utils/api'

export const useFollowUser = () => {
  const {
    mutate: followUser,
    loading,
    error,
    data,
  } = useMutation<
    null,
    {
      followerUser: { username: string }
      followeeUser: { username: string }
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
