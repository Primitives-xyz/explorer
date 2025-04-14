import { IGetSuggestedProfilesResponse } from '@/components/models/profiles.models'
import { useQuery } from '@/utils/api'

interface Props {
  walletAddress: string
  skip?: boolean
}

export function useGetSuggestedProfiles({ walletAddress, skip }: Props) {
  const { data, loading, error, refetch } =
    useQuery<IGetSuggestedProfilesResponse>({
      endpoint: 'profiles/suggested',
      queryParams: {
        walletAddress,
      },
      skip: !walletAddress || skip,
    })

  return {
    profiles: data,
    loading,
    error,
    refetch,
  }
}
