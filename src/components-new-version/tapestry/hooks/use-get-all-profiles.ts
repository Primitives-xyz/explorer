import { IGetProfilesResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'

export const useGetAllProfiles = () => {
  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: 'profiles',
  })

  return {
    profiles: data,
    loading,
    error,
    refetch,
  }
}
