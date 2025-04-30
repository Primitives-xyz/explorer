import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'
import { useValidateWallet } from '@/utils/use-validate-wallet'

interface Props {
  walletAddress: string
  skip?: boolean
}

export const useGetProfiles = ({ walletAddress, skip }: Props) => {
  const { isValid } = useValidateWallet({
    walletAddress,
  })

  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: 'profiles',
    queryParams: {
      walletAddress,
    },
    skip: !isValid || skip,
  })

  return {
    profiles: data,
    loading,
    error,
    refetch,
  }
}
