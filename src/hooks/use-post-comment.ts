import { useState } from 'react'

interface PostCommentInput {
  profileId: string
  targetProfileId: string
  text: string
  commentId?: string
}

export function usePostComment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const postComment = async ({
    profileId,
    targetProfileId,
    text,
    commentId,
  }: PostCommentInput) => {
    setIsLoading(true)
    setError(null)

    console.log('commentId in usePostComment', commentId)

    let body: {
      profileId: string
      targetProfileId: string
      text: string
      commentId?: string
    } = {
      profileId,
      targetProfileId,
      text,
    }

    if (commentId) {
      body.commentId = commentId
    }

    console.log('body in usePostComment', body)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
