import useSWR from 'swr'
import { useProfileFollowers } from './use-profile-followers'
import { useProfileFollowing } from './use-profile-following'
import { useProfileComments } from './use-profile-comments'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { useEffect, useMemo, useRef, useState } from 'react'

export interface ProfileData {
  walletAddress: string
  socialCounts?: {
    followers: number
    following: number
  }
  profile: {
    created_at: string
    image: string | null
    bio?: string  // Keep as optional string to match existing patterns
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

const fetcher = async (url: string): Promise<ProfileData> => {
  const res = await fetch(url)
  if (res.status === 500) {
    window.location.href = '/'
    throw new Error('Server error')
  }
  if (!res.ok) throw new Error('Failed to fetch profile')
  const data = await res.json()
  if (!data.walletAddress) {
    throw new Error('Invalid profile data: missing walletAddress')
  }
  return data
}

export function useProfileData(username: string, mainUsername?: string | null) {
  const [state, setState] = useState<ProfileState>({ type: 'loading' })
  const prevDataRef = useRef<LoadedState | null>(null)
  const isInitialLoadRef = useRef(true)

  const { data, isLoading } = useSWR<ProfileData>(
    `/api/profiles/${username}?fromUsername=${mainUsername}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      refreshInterval: 10000,
    },
  )

  const {
    profiles,
    loading: loadingProfiles,
    error: profilesError,
  } = useGetProfiles(data?.walletAddress || '', true)

  const {
    followers,
    isLoading: isLoadingFollowers,
    error: _followersError,
  } = useProfileFollowers(username)

  const {
    following,
    isLoading: isLoadingFollowing,
    error: _followingError,
  } = useProfileFollowing(username)

  const { comments, isLoading: isLoadingComments } = useProfileComments(
    username,
    mainUsername || undefined,
  )

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
      setState({ type: 'loading' })
      return
    }

    const newState: LoadedState = {
      type: 'loaded',
      data: {
        ...data,
        profile: {
          ...data.profile,
          bio: data.profile?.bio || ''  // Keep bio as optional string, default to empty string
        }
      },
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

  // Keep the debug logs
  useEffect(() => {
    console.log('[useProfileData] state changed:', {
      state,
      bio: state.type === 'loaded' ? state.data.profile?.bio : undefined,
      profile: state.type === 'loaded' ? state.data.profile : undefined
    })
  }, [state])

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
        isLoadingFollowers: true,
        isLoadingFollowing: true,
        isLoadingComments: true,
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
  }, [state])
}
