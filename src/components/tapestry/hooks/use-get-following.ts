import { IGetSocialResponse } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'

interface Props {
  username?: string
}

export function useGetFollowing({ username }: Props) {
  const { data, loading, error, refetch } = useQuery<IGetSocialResponse>({
    endpoint: `profiles/${username}/following`,
    skip: !username,
  })

  return {
    following: data,
    loading,
    error,
    refetch,
  }
}
