import useSWR from 'swr'

interface Comment {
  id: string
  text: string
  profileId: string
  contentId: string
  commentId?: string
  createdAt: string
  updatedAt: string
}

interface GetCommentsResponse {
  comments: Comment[]
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
  const { data, error, mutate } = useSWR<GetCommentsResponse>(
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
    comments: data?.comments || [],
    count: data?.comments?.length || 0,
    isLoading: !error && !data,
    error,
    mutate,
  }
}
