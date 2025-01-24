import useSWR from 'swr'

interface CommentItem {
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
  const data = await res.json()

  // Transform the response to include author information
  const commentsWithAuthors = await Promise.all(
    data.comments.map(async (comment: CommentItem) => {
      try {
        const authorRes = await fetch(
          `/api/profiles/${comment.comment.profileId}`,
        )
        if (!authorRes.ok) throw new Error('Failed to fetch author')
        const authorData = await authorRes.json()

        return {
          ...comment,
          author: {
            username: comment.author?.id, // profileId is the username in this case
            image: authorData.profile?.image || null,
          },
        }
      } catch (error) {
        return {
          ...comment,
          author: {
            username: comment.author?.id,
            image: comment.author?.image,
          },
        }
      }
    }),
  )

  return {
    ...data,
    comments: commentsWithAuthors,
  }
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
