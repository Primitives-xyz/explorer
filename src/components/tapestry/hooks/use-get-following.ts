import { IGetSocialResponse } from '@/components/models/profiles.models'
import { useQuery } from '@/components/utils/api'

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
