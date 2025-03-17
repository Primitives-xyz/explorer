import { IGetProfilesResponse } from '@/components-new-version/tapestry/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'
import { isValidSolanaAddress } from '@/utils/validation'

export const useGetProfiles = (walletAddress: string) => {
  if (walletAddress && !isValidSolanaAddress(walletAddress)) {
    throw new Error('Invalid Solana wallet address')
  }

  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: 'profiles',
    queryParams: { walletAddress },
    skip: !walletAddress,
  })

  return {
    profiles: data?.profiles ?? null,
    loading,
    error,
    refetch,
  }
}
