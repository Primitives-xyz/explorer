'use client'

import { IGetProfileResponse } from '@/components/models/profiles.models'
import { useQuery } from '@/utils/api'

interface Props {
  username: string
  mainUsername?: string
}

export const useGetProfileInfo = ({ username, mainUsername }: Props) => {
  const { data, error, loading, refetch } = useQuery<IGetProfileResponse>({
    endpoint: `profiles/${username}?fromUsername=${mainUsername}`,
  })

  return {
    profileInfo: data,
    loading,
    error,
    refetch,
  }
}
