import { IGetProfilesResponse } from '@/components/models/profiles.models'
import { useQuery } from '@/components/utils/api'

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
