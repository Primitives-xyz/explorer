import { IGetProfilesResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'
import { isValidSolanaAddress } from '@/utils/validation'

interface Props {
  walletAddress: string
}

export const useGetProfiles = ({ walletAddress }: Props) => {
  if (walletAddress && !isValidSolanaAddress(walletAddress)) {
    throw new Error('Invalid Solana wallet address')
  }

  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: 'profiles',
    queryParams: {
      walletAddress,
    },
    skip: !walletAddress,
  })

  return {
    profiles: data,
    loading,
    error,
    refetch,
  }
}
