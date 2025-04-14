import { INamespaceProfileInfos } from '@/components-new-version/models/namespace.models'
import { IGetProfilesResponse } from '@/components-new-version/models/profiles.models'
import { useGetProfiles } from '@/components-new-version/tapestry/hooks/use-get-profiles'
import { useQuery } from '@/components-new-version/utils/api'
import { useEffect, useRef, useState } from 'react'

interface LoadingState {
  type: 'loading'
}

interface LoadedState {
  type: 'loaded'
  data: INamespaceProfileInfos
  profiles?: IGetProfilesResponse
  walletAddressError: boolean
}

interface ErrorState {
  type: 'error'
  error: string
}

type ProfileState = LoadingState | LoadedState | ErrorState

interface Props {
  username: string
  mainUsername?: string | null
  namespace?: string | null
}

export function useNamespaceProfile({
  username,
  mainUsername,
  namespace,
}: Props) {
  const [state, setState] = useState<ProfileState>({ type: 'loading' })
  const prevDataRef = useRef<LoadedState | null>(null)
  const isInitialLoadRef = useRef(true)

  const hasNamespace =
    namespace !== undefined && namespace !== null && namespace !== ''

  const url = !hasNamespace
    ? `/profiles/${username}?fromUsername=${mainUsername}`
    : `/profiles/${username}?namespace=${namespace}`

  const { data, loading } = useQuery<INamespaceProfileInfos>({
    endpoint: url,
  })

  const {
    profiles,
    loading: loadingProfiles,
    error: profilesError,
  } = useGetProfiles({ walletAddress: data?.walletAddress || '' })

  useEffect(() => {
    if (isInitialLoadRef.current && loading) {
      setState({ type: 'loading' })
      isInitialLoadRef.current = false
    }
  }, [loading])

  function isEqualProfileData(
    a: INamespaceProfileInfos,
    b: INamespaceProfileInfos
  ): boolean {
    return (
      a.walletAddress === b.walletAddress &&
      a.profile.image === b.profile.image &&
      a.profile.bio === b.profile.bio &&
      a.namespace?.name === b.namespace?.name &&
      a.namespace?.userProfileURL === b.namespace?.userProfileURL
    )
  }

  useEffect(() => {
    if (loading) {
      return
    }

    if (profilesError?.message?.includes('Server error')) {
      setState({ type: 'error', error: 'Server error' })
      return
    }

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

    if (
      !prevDataRef.current ||
      !isEqualProfileData(prevDataRef.current.data, newState.data)
    ) {
      prevDataRef.current = newState
      setState(newState)
    }
  }, [data, profiles, loading, profilesError])

  if (state.type === 'loading') {
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
}
