import { IGetProfilesResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'

interface Props {
  skip?: boolean
}

export const useGetRecentProfiles = ({ skip }: Props) => {
  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: 'profiles',
    skip,
  })

  return {
    profiles: data,
    loading,
    error,
    refetch,
  }
}
