import { IGetSocialResponse } from '@/components/models/profiles.models'
import { useQuery } from '@/utils/api'

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
