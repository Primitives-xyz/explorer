import { INamespaceProfileInfos } from '@/components-new-version/models/namespace.models'
import { useGetProfiles } from '@/components-new-version/tapestry/hooks/use-get-profiles'
import { useQuery } from '@/components-new-version/utils/api'

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
  const hasNamespace = !!namespace

  const url = hasNamespace
    ? `/profiles/${username}?namespace=${namespace}`
    : `/profiles/${username}?fromUsername=${mainUsername}`

  const {
    data: profileData,
    loading: loadingProfile,
    error: profileError,
  } = useQuery<INamespaceProfileInfos>({ endpoint: url })

  const walletAddress = profileData?.walletAddress ?? ''
  const {
    profiles,
    loading: loadingProfiles,
    error: profilesError,
  } = useGetProfiles({ walletAddress })

  const isLoading = loadingProfile || loadingProfiles
  const serverError =
    profileError || profilesError?.message?.includes('Server error') || false
  const walletAddressError =
    profilesError?.message === 'Invalid Solana wallet address'

  return {
    profileData,
    profiles,
    isLoading,
    walletAddressError,
    serverError,
  }
}
