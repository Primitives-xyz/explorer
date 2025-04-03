import { ILeaderboardResponse } from '@/components-new-version/models/leaderboard.models'
import { useQuery } from '@/components-new-version/utils/api'

interface Props {
  skip?: boolean
}

export function useLeaderboard({ skip }: Props) {
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
