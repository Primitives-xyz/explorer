import { IGetSuggestedProfilesResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'

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
