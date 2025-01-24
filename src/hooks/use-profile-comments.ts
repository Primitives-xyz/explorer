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
    image: string | null
    id: string
  }
}

interface GetCommentsResponse {
  comments: CommentItem[]
  page: number
  pageSize: number
}

async function fetchComments(url: string): Promise<GetCommentsResponse> {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch comments')
  }
  return await res.json()
}

export function useProfileComments(username: string | null) {
  const { data, error, mutate, isLoading } = useSWR<GetCommentsResponse>(
    username ? `/api/profiles/${username}/comments` : null,
    fetchComments,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
      refreshInterval: 0, // Disable auto-refresh
      dedupingInterval: 0, // Disable deduping
      fallbackData: { comments: [], page: 1, pageSize: 10 },
    },
  )

  return {
    comments:
      data?.comments.map((comment) => ({
        comment: {
          text: comment.comment.text,
          created_at: comment.comment.created_at,
        },
        author: comment.author,
      })) || [],
    count: data?.comments?.length || 0,
    isLoading,
    error,
    mutate,
  }
}
