import { IGetSocialResponse } from '@/components-new-version/tapestry/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'

export function useGetFollowing(username: string) {
  const { data, loading, error } = useQuery<IGetSocialResponse>({
    endpoint: `profiles/${username}/following`,
    skip: !username,
  })

  return {
    following: data,
    loading,
    error,
  }
}
