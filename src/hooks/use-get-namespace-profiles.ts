import { IPaginatedResponse, IProfile } from '@/types/profile.types'
import useSWR from 'swr'

interface GetNamespaceProfilesResponse extends IPaginatedResponse {
  profiles: IProfile[]
  totalCount: number
}

async function fetchNamespaceProfiles(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch namespace profiles')
  }
  return await res.json()
}

export const useGetNamespaceProfiles = ({ name }: { name: string }) => {
  const { data, error, mutate } = useSWR<GetNamespaceProfilesResponse>(
    `/api/profiles?namespace=${name}`,
    fetchNamespaceProfiles
  )

  return {
    data,
    isLoading: !error && !data,
    error,
    mutate,
  }
}
