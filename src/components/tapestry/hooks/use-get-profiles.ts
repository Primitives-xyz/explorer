import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'

interface Props {
  walletAddress: string
  skip?: boolean
  refreshInterval?: number
}

export const useGetProfiles = ({
  walletAddress,
  skip,
  refreshInterval,
}: Props) => {
  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: 'profiles',
    queryParams: {
      walletAddress,
    },
    skip: !walletAddress || skip,
    config: {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      refreshInterval,
    },
  })

  return {
    profiles: data,
    loading,
    error,
    refetch,
  }
}
