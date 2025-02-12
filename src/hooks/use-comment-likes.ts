import { useState } from 'react'
import { mutate } from 'swr'

interface UseLikeCommentResult {
  likeComment: (
    commentId: string,
    profileId: string,
    username: string
  ) => Promise<void>
  unlikeComment: (
    commentId: string,
    profileId: string,
    username: string
  ) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useCommentLikes(): UseLikeCommentResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const likeComment = async (
    commentId: string,
    profileId: string,
    username: string
  ) => {
    setIsLoading(true)
    setError(null)

    // Get the profile comments key for SWR
    const profileCommentsKey = [
      `/api/profiles/${username}/comments${
        profileId ? `?requestingProfileId=${profileId}` : ''
      }`,
      'profile-comments',
    ]

    try {
      // Optimistically update the UI
      await mutate(
        profileCommentsKey,
        (currentData: any) => {
          if (!currentData) return currentData

          const updatedComments = currentData.comments.map((comment: any) => {
            if (comment.comment.id === commentId) {
              return {
                ...comment,
                requestingProfileSocialInfo: {
                  ...comment.requestingProfileSocialInfo,
                  hasLiked: true,
                },
                socialCounts: {
                  ...comment.socialCounts,
                  likeCount: (comment.socialCounts?.likeCount || 0) + 1,
                },
              }
            }
            return comment
          })

          return {
            ...currentData,
            comments: updatedComments,
          }
        },
        false // Don't revalidate yet
      )

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

      // Revalidate after successful API call
      await mutate(profileCommentsKey)
    } catch (err) {
      // Revert optimistic update on error
      await mutate(profileCommentsKey)
      setError(err instanceof Error ? err.message : 'Failed to like comment')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const unlikeComment = async (
    commentId: string,
    profileId: string,
    username: string
  ) => {
    setIsLoading(true)
    setError(null)

    // Get the profile comments key for SWR
    const profileCommentsKey = [
      `/api/profiles/${username}/comments${
        profileId ? `?requestingProfileId=${profileId}` : ''
      }`,
      'profile-comments',
    ]

    try {
      // Optimistically update the UI
      await mutate(
        profileCommentsKey,
        (currentData: any) => {
          if (!currentData) return currentData

          const updatedComments = currentData.comments.map((comment: any) => {
            if (comment.comment.id === commentId) {
              return {
                ...comment,
                requestingProfileSocialInfo: {
                  ...comment.requestingProfileSocialInfo,
                  hasLiked: false,
                },
                socialCounts: {
                  ...comment.socialCounts,
                  likeCount: Math.max(
                    0,
                    (comment.socialCounts?.likeCount || 0) - 1
                  ),
                },
              }
            }
            return comment
          })

          return {
            ...currentData,
            comments: updatedComments,
          }
        },
        false // Don't revalidate yet
      )

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

      // Revalidate after successful API call
      await mutate(profileCommentsKey)
    } catch (err) {
      // Revert optimistic update on error
      await mutate(profileCommentsKey)
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
