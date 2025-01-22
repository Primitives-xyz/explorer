import { useState } from 'react'

interface PostCommentInput {
  profileId: string
  targetProfileId: string
  text: string
}

export function usePostComment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const postComment = async ({
    profileId,
    targetProfileId,
    text,
  }: PostCommentInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          targetProfileId,
          text,
        }),
      })

      console.log('response', response)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment')
      }

      return data
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to post comment'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    postComment,
    isLoading,
    error,
  }
}
