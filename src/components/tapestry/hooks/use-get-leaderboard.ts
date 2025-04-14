import { ILeaderboardResponse } from '@/components/models/leaderboard.models'
import { useQuery } from '@/utils/api'

interface Props {
  skip?: boolean
}

export function useGetLeaderboard({ skip }: Props) {
  const { data, loading, error, refetch } = useQuery<ILeaderboardResponse>({
    endpoint: 'leaderboard',
    skip,
  })

  return {
    traders: data,
    loading,
    error,
    refetch,
  }
}
