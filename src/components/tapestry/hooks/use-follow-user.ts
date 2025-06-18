'use client'

import { useMutation } from '@/utils/api'
import { useCreateFollowContent } from './use-create-follow-content'

export const useFollowUser = () => {
  const { createContentNode } = useCreateFollowContent()
  
  const {
    mutate: followUserMutation,
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

  const followUser = async (params: {
    followerUsername: string
    followeeUsername: string
  }) => {
    try {
      // Execute the follow action
      await followUserMutation(params)
      
      // Create a content node for the follow action
      await createContentNode({
        followerUsername: params.followerUsername,
        followeeUsername: params.followeeUsername,
      })
    } catch (err) {
      console.error('Error in follow user:', err)
      throw err
    }
  }

  return {
    followUser,
    loading,
    error,
    data,
  }
}
