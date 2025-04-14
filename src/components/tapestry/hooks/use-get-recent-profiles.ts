import { IGetProfilesResponse } from '@/components/models/profiles.models'
import { useQuery } from '@/components/utils/api'

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
