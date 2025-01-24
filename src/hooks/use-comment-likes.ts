import { useState } from 'react'

interface UseLikeCommentResult {
  likeComment: (commentId: string, profileId: string) => Promise<void>
  unlikeComment: (commentId: string, profileId: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useCommentLikes(): UseLikeCommentResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const likeComment = async (commentId: string, profileId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to like comment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like comment')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const unlikeComment = async (commentId: string, profileId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/comments/${commentId}/unlike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unlike comment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlike comment')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    likeComment,
    unlikeComment,
    isLoading,
    error,
  }
}
