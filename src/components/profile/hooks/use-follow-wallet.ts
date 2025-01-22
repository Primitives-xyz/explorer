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
      const response = await fetch('/api/followers/follow-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerUsername,
          walletToFollow,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to follow wallet')
      }

      setData(result)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { followWallet, loading, error, success, data }
}
