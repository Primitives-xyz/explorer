import { IGetProfilesResponse } from '@/components/models/profiles.models'
import { useQuery } from '@/utils/api'

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
