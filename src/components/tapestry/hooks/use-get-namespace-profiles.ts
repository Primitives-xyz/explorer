import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'

export const useGetNamespaceProfiles = ({ name }: { name: string }) => {
  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: `profiles?namespace=${name}`,
    skip: !name,
  })

  return {
    data,
    loading,
    error,
    refetch,
  }
}
