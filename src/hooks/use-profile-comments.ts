import useSWR from 'swr'

export interface CommentItem {
  comment: {
    id: string
    text: string
    profileId: string
    contentId: string
    commentId?: string
    created_at: string
    likeCount: number
    isLikedByUser: boolean
  }
  author?: {
    username: string
    id: string
  }
  socialCounts: {
    likeCount: number
  }
  requestingProfileSocialInfo?: {
    hasLiked: boolean
  }
}

interface GetCommentsResponse {
  comments: CommentItem[]
  page: number
  pageSize: number
}

const fetchComments = async ([url, requestingProfileId]: [
  string,
  string | undefined,
]) => {
  console.log('fetchComments called with:', { url, requestingProfileId })

  // Construct the URL with URLSearchParams to properly encode parameters
  const urlObj = new URL(url, window.location.origin)
  if (requestingProfileId) {
    urlObj.searchParams.set('requestingProfileId', requestingProfileId)
  }

  const finalUrl = urlObj.toString()
  console.log('Final URL:', finalUrl)

  const res = await fetch(finalUrl)
  if (!res.ok) {
    console.error('Failed to fetch comments:', await res.text())
    throw new Error('Failed to fetch comments')
  }
  return res.json()
}

export function useProfileComments(
  username: string | null,
  requestingProfileId?: string,
) {
  console.log('useProfileComments - username:', username)
  console.log('useProfileComments - requestingProfileId:', requestingProfileId)

  let url = null
  if (!!username) {
    url = `/api/profiles/${username}/comments`
  }

  // Add debug log to verify the key construction
  const swr_key =
    url && requestingProfileId ? [url, requestingProfileId] : url ? [url] : null
  console.log('SWR key:', swr_key)

  const { data, error, mutate, isLoading } = useSWR<GetCommentsResponse>(
    swr_key,
    fetchComments,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
      refreshInterval: 0,
      dedupingInterval: 0,
      fallbackData: { comments: [], page: 1, pageSize: 10 },
    },
  )

  return {
    comments: data?.comments || [],
    count: data?.comments?.length || 0,
    isLoading,
    error,
    mutate,
  }
}
