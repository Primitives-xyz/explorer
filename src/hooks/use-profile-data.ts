import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import { useProfileComments } from './use-profile-comments'
import { useProfileFollowers } from './use-profile-followers'
import { useProfileFollowing } from './use-profile-following'

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
    name?: string,
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
  followers: any[]
  following: any[]
  comments: any[]
  walletAddressError: boolean
}

interface ErrorState {
  type: 'error'
  error: string
}

type ProfileState = LoadingState | LoadedState | ErrorState

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 500) {
    window.location.href = '/'
    throw new Error('Server error')
  }
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export function useProfileData(username: string, mainUsername?: string | null, namespace?: string | null) {
  const [state, setState] = useState<ProfileState>({ type: 'loading' })
  const prevDataRef = useRef<LoadedState | null>(null)
  const isInitialLoadRef = useRef(true)
  
  // Check if namespace exists and is not null
  const hasNamespace = namespace !== undefined && namespace !== null && namespace !== ''

  let url = !hasNamespace
    ? `/api/profiles/${username}?fromUsername=${mainUsername}`
    : `/api/profiles/${username}?namespace=${namespace}`
  
  const { data, isLoading } = useSWR<ProfileData>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      refreshInterval: 10000,
    }
  )

  const {
    profiles,
    loading: loadingProfiles,
    error: profilesError,
  } = useGetProfiles(data?.walletAddress || '')

  const {
    followers,
    isLoading: isLoadingFollowers,
    error: _followersError,
  } = useProfileFollowers(username, namespace)

  const {
    following,
    isLoading: isLoadingFollowing,
    error: _followingError,
  } = useProfileFollowing(username, namespace)

  const { comments: rawComments, isLoading: isLoadingComments } = useProfileComments(
    username, 
    mainUsername || undefined
  );

  const comments = hasNamespace ? [] : rawComments;

  const isLoading_All =
    isLoading ||
    loadingProfiles ||
    isLoadingFollowers ||
    isLoadingFollowing ||
    isLoadingComments

  // Handle initial loading state
  useEffect(() => {
    if (isInitialLoadRef.current && isLoading_All) {
      setState({ type: 'loading' })
      isInitialLoadRef.current = false
    }
  }, [isLoading_All])

  // Handle data updates
  useEffect(() => {
    // Skip if we're still loading any data
    if (isLoading_All) {
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
      followers: followers || [],
      following: following || [],
      comments: comments || [],
      walletAddressError:
        profilesError?.message === 'Invalid Solana wallet address',
    }

    // Only update if the data has actually changed
    const prevStateStr = prevDataRef.current
      ? JSON.stringify(prevDataRef.current)
      : null
    const newStateStr = JSON.stringify(newState)

    if (!prevDataRef.current || prevStateStr !== newStateStr) {
      prevDataRef.current = newState
      setState(newState)
    }
  }, [
    data,
    profiles,
    followers,
    following,
    comments,
    isLoading_All,
    profilesError,
  ])

  // Transform state into the expected return type
  return useMemo(() => {
    if (state.type === 'loading') {
      // If we have previous data, return it with loading flags
      if (prevDataRef.current) {
        return {
          ...prevDataRef.current,
          isLoading: true,
          isLoadingFollowers: true,
          isLoadingFollowing: true,
          isLoadingComments: true,
        }
      }

      return {
        profileData: undefined,
        profiles: null,
        followers: [],
        following: [],
        comments: [],
        isLoading: true,
        isLoadingFollowers:  true,
        isLoadingFollowing:  true,
        isLoadingComments:  true,
        walletAddressError: false,
        serverError: false,
        followersError: null,
        followingError: null,
      }
    }

    if (state.type === 'error') {
      return {
        profileData: undefined,
        profiles: null,
        followers: [],
        following: [],
        comments: [],
        isLoading: false,
        isLoadingFollowers: false,
        isLoadingFollowing: false,
        isLoadingComments: false,
        walletAddressError: false,
        serverError: true,
        followersError: null,
        followingError: null,
      }
    }

    return {
      profileData: state.data,
      profiles: state.profiles,
      followers: state.followers,
      following: state.following,
      comments: state.comments,
      isLoading: false,
      isLoadingFollowers: false,
      isLoadingFollowing: false,
      isLoadingComments: false,
      walletAddressError: state.walletAddressError,
      serverError: false,
      followersError: null,
      followingError: null,
    }
  }, [
    state, 
    hasNamespace
  ])
}