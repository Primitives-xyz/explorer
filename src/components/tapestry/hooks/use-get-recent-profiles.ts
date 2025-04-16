import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'

interface Props {
  skip?: boolean
}

export const useGetRecentProfiles = ({ skip }: Props = {}) => {
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
