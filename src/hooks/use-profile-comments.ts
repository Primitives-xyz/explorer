import useSWR from 'swr'

export interface CommentItem {
  comment: {
    id: string
    text: string
    profileId: string
    contentId: string
    commentId?: string
    created_at: string
  }
  author?: {
    username: string
    id: string
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

async function fetchComments(url: string): Promise<GetCommentsResponse> {
  const urlObj = new URL(url, window.location.origin)
  const res = await fetch(urlObj.toString())
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch comments')
  }
  return await res.json()
}

export function useProfileComments(
  username: string | null,
  mainUsername?: string,
) {
  const url = username
    ? `/api/profiles/${username}/comments${
        mainUsername ? `?requestingProfileId=${mainUsername}` : ''
      }`
    : null

  const { data, error, mutate, isLoading } = useSWR<GetCommentsResponse>(
    [url, 'profile-comments'],
    ([url]) => fetchComments(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      revalidateIfStale: true,
      refreshInterval: 0, // Disable auto-refresh
      dedupingInterval: 0, // Disable deduping
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
