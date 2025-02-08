'use client'

import { useState } from 'react'

interface FollowWalletProps {
  followerUsername: string
  walletToFollow: string
}

export const useFollowWallet = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const followWallet = async ({
    followerUsername,
    walletToFollow,
  }: FollowWalletProps) => {
    setLoading(true)
    setError(null)
    setData(null)
    setSuccess(false)

    try {
      let response
      try {
        response = await fetch('/api/followers/follow-wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            followerUsername,
            walletToFollow,
          }),
        })
      } catch (fetchError) {
        setError('Network error - please check your connection')
        return false
      }

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        setError('Invalid response from server')
        return false
      }

      if (!response.ok) {
        setError(result.error || 'Failed to follow wallet')
        return false
      }

      setData(result)
      setSuccess(true)
      return true
    } catch (err: any) {
      setError('Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  const unfollowWallet = async ({
    followerUsername,
    walletToFollow,
  }: FollowWalletProps) => {
    setLoading(true)
    setError(null)
    setData(null)
    setSuccess(false)

    try {
      let response
      try {
        response = await fetch('/api/followers/unfollow-wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            followerUsername,
            walletToFollow,
          }),
        })
      } catch (fetchError) {
        setError('Network error - please check your connection')
        return false
      }

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        setError('Invalid response from server')
        return false
      }

      if (!response.ok) {
        setError(result.error || 'Failed to unfollow wallet')
        return false
      }

      setData(result)
      setSuccess(true)
      return true
    } catch (err: any) {
      setError('Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { followWallet, unfollowWallet, loading, error, success, data }
}
