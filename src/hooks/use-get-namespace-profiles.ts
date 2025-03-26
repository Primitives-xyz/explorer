import { IGetProfilesResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'

async function fetchNamespaceProfiles(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch namespace profiles')
  }
  return await res.json()
}

export const useGetNamespaceProfiles = ({ name }: { name: string }) => {
  // const { data, error, mutate } = useSWR<IGetProfilesResponse>(
  //   `/api/profiles?namespace=${name}`,
  //   fetchNamespaceProfiles
  // )

  // return {
  //   data,
  //   isLoading: !error && !data,
  //   error,
  //   mutate,
  // }

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
