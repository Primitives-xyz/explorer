import { IGetSocialResponse } from '@/components-new-version/tapestry/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'

export function useGetFollowers(username: string) {
  const { data, loading, error } = useQuery<IGetSocialResponse>({
    endpoint: `profiles/${username}/followers`,
    skip: !username,
  })

  return {
    followers: data,
    loading,
    error,
  }
}
