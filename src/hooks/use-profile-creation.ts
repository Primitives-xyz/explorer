import { refreshProfiles } from '@/components/auth/hooks/use-get-profiles'
import { DICEBEAR_API_BASE } from '@/lib/constants'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useState } from 'react'

interface UseProfileCreationProps {
  walletAddress: string | undefined
  onProfileCreated?: () => void
}

interface UseProfileCreationReturn {
  loading: boolean
  error: string | null
  response: any | null
  createProfile: (
    username: string,
    bio: string,
    imageUrl: string
  ) => Promise<void>
  updateProfileSetupModalShownStatus: (walletAddress: string) => Promise<void>
}

export function useProfileCreation({
  walletAddress,
  onProfileCreated,
}: UseProfileCreationProps): UseProfileCreationReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<any | null>(null)
  const { authToken } = useDynamicContext()

  const createProfile = async (
    username: string,
    bio: string,
    imageUrl: string
  ) => {
    if (!walletAddress || !username) return false

    try {
      setError(null)
      setLoading(true)
      setResponse(null)

      const res = await fetch(`/api/profiles/${walletAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      })

      const finalImageUrl =
        imageUrl || `${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`

      let profileData = await res.json()
      let response
      let data

      if (res.ok && profileData?.profile?.id) {
        const profileIdentifier = profileData.profile.username || walletAddress
        response = await fetch(`/api/profiles/${profileIdentifier}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            username,
            image: finalImageUrl,
            bio,
          }),
        })
      } else {
        response = await fetch('/api/profiles/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            username,
            ownerWalletAddress: walletAddress,
            profileImageUrl: finalImageUrl,
            bio,
          }),
        })
      }

      data = await response.json()

      if (response && response.ok === false) {
        throw new Error(
          data.error || data.details || 'Failed to create profile'
        )
      }

      setResponse(data)
      await refreshProfiles(walletAddress)
      onProfileCreated?.()
      
      // Return success status
      return true
    } catch (err: any) {
      console.error('Profile creation error:', err)
      setError(err.message || 'Failed to create profile')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateProfileSetupModalShownStatus = async (walletAddress: string) => {
    try {
      const response = await fetch(`api/profiles/${walletAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: walletAddress,
          properties: [
            {
              key: 'hasSeenProfileSetupModal',
              value: true,
            },
          ],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || data.details || 'Failed to update profile'
        )
      }
    } catch (error) {
      console.error('Failed to update modal count:', error)
    }
  }

  return {
    loading,
    error,
    response,
    createProfile,
    updateProfileSetupModalShownStatus,
  }
}
