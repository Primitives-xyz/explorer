import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'

export const useGetNamespaceProfiles = ({ name }: { name: string }) => {
  // For kolscan, use a larger pageSize to get more KOL profiles
  const pageSize = name === 'kolscan' ? 25 : 10

  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: `profiles?namespace=${name}&pageSize=${pageSize}`,
    skip: !name,
  })

  return {
    data,
    loading,
    error,
    refetch,
  }
}
