'use client'

import { useQuery } from '@/utils/api'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface ContentCommentsResponse {
  comments: Array<{
    id: string
    text: string
    created_at: string | number
    profile: {
      username: string
      image?: string
    }
    socialCounts?: {
      likeCount: number
    }
    requestingProfileSocialInfo?: {
      hasLiked: boolean
    }
  }>
}

export function useContentComments({
  contentId,
  enabled = true,
}: {
  contentId?: string
  enabled?: boolean
}) {
  const { mainProfile } = useCurrentWallet()

  const { data, loading, error, refetch } = useQuery<ContentCommentsResponse>({
    endpoint: `content/${contentId}/comments`,
    queryParams: {
      ...(mainProfile?.username && {
        requestingProfileId: mainProfile.username,
      }),
    },
    skip: !enabled || !contentId,
  })

  return {
    comments: data?.comments ?? [],
    loading,
    error,
    refetch,
  }
}
