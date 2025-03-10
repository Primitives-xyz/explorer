import { ProfileWithStats } from '@/components/profile/profile-card'
import { getProfiles } from '@/utils/api'
import { useCallback, useEffect, useState } from 'react'

export interface ProfileData {
  profiles: ProfileWithStats[]
  totalCount?: number
}

interface LoadingState {
  type: 'loading'
}

interface LoadedState {
  type: 'loaded'
  data: ProfileData
  profiles: any[] | null
  walletAddressError: boolean
}

interface ErrorState {
  type: 'error'
  error: string
}

type ProfileState = LoadingState | LoadedState | ErrorState

// Memoize the fetcher function to prevent unnecessary recreations
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 500) {
    window.location.href = '/'
    throw new Error('Server error')
  }
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

interface UseProfileDataProps {
  walletAddress?: string
  profileData?: ProfileData | null
  hasSearched?: boolean
  isLoadingProfileData?: boolean
  propError?: string | null
}

interface UseProfileDataResult {
  profiles: ProfileWithStats[]
  isLoading: boolean
  error: string | null
  resetState: () => void
}

/**
 * Custom hook to fetch and manage profile data
 */
export const useProfileData = ({
  walletAddress,
  profileData,
  hasSearched,
  isLoadingProfileData,
  propError,
}: UseProfileDataProps): UseProfileDataResult => {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cleanup function to reset state
  const resetState = useCallback(() => {
    setProfiles([])
    setError(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Reset state on mount and cleanup on unmount
    resetState()
    return resetState
  }, [resetState])

  useEffect(() => {
    let isMounted = true

    const fetchProfiles = async () => {
      if (!walletAddress && !profileData && !hasSearched) return
      if (isLoadingProfileData) return

      // Reset state before fetching new data
      resetState()
      if (!isMounted) return

      setIsLoading(true)

      try {
        if (profileData && isMounted) {
          setProfiles(profileData.profiles)
        } else if (walletAddress && isMounted) {
          const profilesData = await getProfiles(walletAddress)

          if (!isMounted) return

          if (!profilesData.items || profilesData.items.length === 0) {
            setProfiles([])
            return
          }

          setProfiles(profilesData.items)
        }
      } catch (error) {
        console.error('Profiles fetch error:', error)
        if (isMounted) {
          setError(propError || 'Failed to fetch profiles.')
          setProfiles([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProfiles()

    return () => {
      isMounted = false
    }
  }, [
    walletAddress,
    profileData,
    propError,
    hasSearched,
    isLoadingProfileData,
    resetState,
  ])

  return {
    profiles,
    isLoading,
    error,
    resetState,
  }
}
