import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'

export interface ProfileData {
  walletAddress: string
  socialCounts?: {
    followers: number
    following: number
  }
  profile: {
    created_at: string
    image: string | null
    bio?: string
  }
  namespace?: {
    name?: string
    userProfileURL?: string
  }
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

export function useProfileData(
  username: string,
  mainUsername?: string | null,
  namespace?: string | null
) {
  const [state, setState] = useState<ProfileState>({ type: 'loading' })
  const prevDataRef = useRef<LoadedState | null>(null)
  const isInitialLoadRef = useRef(true)

  // Memoize the hasNamespace value to prevent unnecessary recalculations
  const hasNamespace = useMemo(
    () => namespace !== undefined && namespace !== null && namespace !== '',
    [namespace]
  )

  // Memoize the URL to prevent unnecessary recreations
  const url = useMemo(() => {
    return !hasNamespace
      ? `/api/profiles/${username}?fromUsername=${mainUsername}`
      : `/api/profiles/${username}?namespace=${namespace}`
  }, [username, mainUsername, namespace, hasNamespace])

  // Configure SWR with optimized settings
  const { data, isLoading } = useSWR<ProfileData>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // Increased to 1 minute
    refreshInterval: 60000, // Increased to 1 minute
    revalidateIfStale: false,
    keepPreviousData: true,
  })

  // Memoize the wallet address to prevent unnecessary rerenders
  const walletAddress = useMemo(
    () => data?.walletAddress || '',
    [data?.walletAddress]
  )

  const {
    profiles,
    loading: loadingProfiles,
    error: profilesError,
  } = useGetProfiles(walletAddress)

  // Handle initial loading state
  useEffect(() => {
    if (isInitialLoadRef.current && isLoading) {
      setState({ type: 'loading' })
      isInitialLoadRef.current = false
    }
  }, [isLoading])

  // Create a stable comparison function for deep equality checks
  const isEqual = useCallback((objA: any, objB: any) => {
    if (objA === objB) return true
    if (!objA || !objB) return false

    // Compare only the essential properties to reduce unnecessary updates
    const keysToCompare = ['walletAddress', 'profile', 'namespace']

    for (const key of keysToCompare) {
      if (JSON.stringify(objA[key]) !== JSON.stringify(objB[key])) {
        return false
      }
    }

    return true
  }, [])

  // Handle data updates with optimized dependency array and deep comparison
  useEffect(() => {
    // Skip if we're still loading any data
    if (isLoading) {
      return
    }

    // Handle server error
    if (profilesError?.message?.includes('Server error')) {
      setState({ type: 'error', error: 'Server error' })
      return
    }

    // Only proceed if we have the main profile data
    if (!data) {
      return
    }

    const newState: LoadedState = {
      type: 'loaded',
      data,
      profiles,
      walletAddressError:
        profilesError?.message === 'Invalid Solana wallet address',
    }

    // Only update if the data has actually changed using deep comparison
    if (
      !prevDataRef.current ||
      !isEqual(prevDataRef.current.data, newState.data)
    ) {
      prevDataRef.current = newState
      setState(newState)
    }
  }, [data, profiles, isLoading, profilesError, isEqual])

  // Transform state into the expected return type with memoization
  return useMemo(() => {
    if (state.type === 'loading') {
      // If we have previous data, return it with loading flags
      if (prevDataRef.current) {
        return {
          profileData: prevDataRef.current.data,
          profiles: prevDataRef.current.profiles,
          isLoading: true,
          walletAddressError: prevDataRef.current.walletAddressError,
          serverError: false,
        }
      }

      return {
        profileData: undefined,
        profiles: null,
        isLoading: true,
        walletAddressError: false,
        serverError: false,
      }
    }

    if (state.type === 'error') {
      return {
        profileData: undefined,
        profiles: null,
        comments: [],
        isLoading: false,
        isLoadingComments: false,
        walletAddressError: false,
        serverError: true,
      }
    }

    return {
      profileData: state.data,
      profiles: state.profiles,
      isLoading: false,
      walletAddressError: state.walletAddressError,
      serverError: false,
    }
  }, [state, isLoading])
}
