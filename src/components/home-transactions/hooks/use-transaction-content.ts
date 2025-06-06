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

  console.log('MAIN PROFILE +++++++', mainProfile?.username)
  console.log('signature +++++++', signature)

  const { data, loading, error, refetch } = useQuery<ContentResponse>({
    endpoint: `content/${signature}`,
    queryParams: {
      ...(mainProfile?.username && {
        requestingProfileId: mainProfile.username,
      }),
    },
    skip: !enabled || !signature,
  })

  return {
    content: data,
    loading,
    error,
    refetch,
  }
}
