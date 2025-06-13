'use client'

import { useQuery } from '@/utils/api'
import { ContentResponse } from '@/utils/content-server'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface UseTransactionContentParams {
  signature?: string
  enabled?: boolean
}

export const useTransactionContent = ({
  signature,
  enabled = true,
}: UseTransactionContentParams) => {
  const { mainProfile } = useCurrentWallet()

  const { data, loading, error, refetch } = useQuery<ContentResponse>({
    endpoint: `content/${signature}`,
    queryParams: {
      ...(mainProfile?.username && {
        requestingProfileId: mainProfile.username,
      }),
    },
    skip: !enabled || !signature,
    // Optimize SWR config for deduplication and caching
    config: {
      // Cache data for 5 minutes
      refreshInterval: 5 * 60 * 1000,
      // Don't refetch on window focus
      revalidateOnFocus: false,
      // Keep stale data while revalidating
      keepPreviousData: true,
      // Dedupe requests within 30 seconds
      dedupingInterval: 30 * 1000,
    },
  })

  return {
    content: data,
    loading,
    error,
    refetch,
  }
}
