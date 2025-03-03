interface Namespace {
  name: string
  readableName: string
  faviconURL: string
  userProfileURL: string
}

interface Profile {
  image: string
  namespace: string
  created_at: number
  id: string
  username: string
}

interface Wallet {
  address: string
}

interface SuggestedProfile {
  namespaces: Namespace[]
  profile: Profile
  wallet: Wallet
}

interface SuggestedProfilesResponse {
  [key: string]: SuggestedProfile
}

import { useCallback, useState } from 'react'

export const useSuggested = () => {
  const [profiles, setProfiles] = useState<SuggestedProfilesResponse | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSuggested = useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      setError('Owner wallet address is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/profiles/suggested?walletAddress=${walletAddress}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch suggested profiles')
      }

      const data = await response.json()
      setProfiles(data)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    profiles: profiles ? Object.values(profiles) : [],
    totalCount: profiles ? Object.keys(profiles).length : 0,
    loading,
    error,
    getSuggested,
  }
}
