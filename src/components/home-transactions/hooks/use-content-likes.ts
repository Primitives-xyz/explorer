'use client'

import { IProfile } from '@/components/tapestry/models/profiles.models'
import { FetchMethod, useMutation, useQuery } from '@/utils/api'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface UseLikeContentParams {
  contentId: string
  enabled?: boolean
}

interface LikeUsersResponse {
  profiles: IProfile[]
}

export const useLikeContent = ({ contentId }: { contentId: string }) => {
  const { mainProfile } = useCurrentWallet()

  const {
    mutate: likeContent,
    loading: likingContent,
    error: likeError,
  } = useMutation<null, { profileId: string }>({
    endpoint: `content/${contentId}/like`,
    method: FetchMethod.POST,
  })

  const {
    mutate: unlikeContent,
    loading: unlikingContent,
    error: unlikeError,
  } = useMutation<null, { profileId: string }>({
    endpoint: `content/${contentId}/like`,
    method: FetchMethod.DELETE,
  })

  const handleLike = async () => {
    if (!mainProfile?.username) return

    try {
      await likeContent({ profileId: mainProfile.username })
    } catch (error) {
      console.error('Error liking content:', error)
    }
  }

  const handleUnlike = async () => {
    if (!mainProfile?.username) return

    try {
      await unlikeContent({ profileId: mainProfile.username })
    } catch (error) {
      console.error('Error unliking content:', error)
    }
  }

  return {
    likeContent: handleLike,
    unlikeContent: handleUnlike,
    loading: likingContent || unlikingContent,
    error: likeError || unlikeError,
  }
}

export const useContentLikes = ({
  contentId,
  enabled = true,
}: UseLikeContentParams) => {
  const { data, loading, error, refetch } = useQuery<LikeUsersResponse>({
    endpoint: `content/${contentId}/likes`,
    skip: !enabled || !contentId,
  })

  return {
    users: data?.profiles || [],
    loading,
    error,
    refetch,
  }
}
