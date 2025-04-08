import { IGetProfilesResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'
import { useValidateWallet } from '@/components-new-version/utils/use-validate-wallet'

interface Props {
  walletAddress: string
}

export const useGetProfiles = ({ walletAddress }: Props) => {
  const { isValid } = useValidateWallet({
    walletAddress,
  })

  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: 'profiles',
    queryParams: {
      walletAddress,
    },
    skip: !isValid,
  })

  return {
    profiles: data,
    loading,
    error,
    refetch,
  }
}
