import { IGetSocialResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'

interface Props {
  username: string
}

export function useGetFollowers({ username }: Props) {
  const { data, loading, error, refetch } = useQuery<IGetSocialResponse>({
    endpoint: `profiles/${username}/followers`,
    skip: !username,
  })

  return {
    followers: data,
    loading,
    error,
    refetch,
  }
}
