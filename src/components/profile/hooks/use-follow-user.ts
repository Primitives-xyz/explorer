'use client'

import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface FollowUserProps {
  followerUsername: string
  followeeUsername: string
}

export const useFollowUser = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const { toast } = useToast()

  const followUser = async ({
    followerUsername,
    followeeUsername,
  }: FollowUserProps) => {
    setLoading(true)
    setError(null)
    setData(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/followers/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerUser: { username: followerUsername },
          followeeUser: { username: followeeUsername },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to follow user')
      }

      setData(result)
      setSuccess(true)
      toast({
        variant: 'success',
        title: 'Success',
        description: `You are now following ${followeeUsername}`,
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong'
      setError(errorMessage)
      toast({
        variant: 'error',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const unfollowUser = async ({
    followerUsername,
    followeeUsername,
  }: FollowUserProps) => {
    setLoading(true)
    setError(null)
    setData(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/followers/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerUser: { username: followerUsername },
          followeeUser: { username: followeeUsername },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to unfollow user')
      }

      setData(result)
      setSuccess(true)
      toast({
        variant: 'pending',
        title: 'Success',
        description: `You have unfollowed ${followeeUsername}`,
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong'
      setError(errorMessage)
      toast({
        variant: 'error',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return { followUser, unfollowUser, loading, error, success, data }
}
