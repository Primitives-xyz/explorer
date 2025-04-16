'use client'

import { IGetProfileResponse } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'

interface Props {
  username: string
  mainUsername?: string
}

export const useGetProfileInfo = ({ username, mainUsername }: Props) => {
  const { data, error, loading, refetch } = useQuery<IGetProfileResponse>({
    endpoint: `profiles/${username}`,
    queryParams: mainUsername ? { fromUsername: mainUsername } : undefined,
  })

  return {
    profileInfo: data,
    loading,
    error,
    refetch,
  }
}
