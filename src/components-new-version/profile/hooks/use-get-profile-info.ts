'use client'

import { IGetProfileResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'

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
