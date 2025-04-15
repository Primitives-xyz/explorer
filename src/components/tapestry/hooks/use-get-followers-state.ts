'use client'

import { IGetFollowersStateResponse } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'

interface Props {
  followeeUsername: string
  followerUsername: string
}

export const useGetFollowersState = ({
  followeeUsername,
  followerUsername,
}: Props) => {
  const { data, error, loading, refetch } =
    useQuery<IGetFollowersStateResponse>({
      endpoint: 'followers/state',
      queryParams: {
        startId: followerUsername,
        endId: followeeUsername,
      },
    })

  return {
    data,
    loading,
    error,
    refetch,
  }
}
