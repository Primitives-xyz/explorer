import { useState } from 'react'
import useSWR, { mutate } from 'swr'

export function useContentLikes() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const likeContent = async (
    contentId: string,
    profileId: string,
    targetProfileId: string
  ) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/content/${contentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          targetProfileId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to like content')
      }

      // Revalidate content data
      await mutate([
        `/api/content?profileId=${targetProfileId}&requestingProfileId=${profileId}&orderByField=created_at&orderByDirection=DESC`,
        'profile-content',
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like content')
    } finally {
      setIsLoading(false)
    }
  }

  const unlikeContent = async (
    contentId: string,
    profileId: string,
    targetProfileId: string
  ) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/content/${contentId}/like`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          targetProfileId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unlike content')
      }

      // Revalidate content data
      await mutate([
        `/api/content?profileId=${targetProfileId}&requestingProfileId=${profileId}&orderByField=created_at&orderByDirection=DESC`,
        'profile-content',
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlike content')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    likeContent,
    unlikeContent,
    isLoading,
    error,
  }
}
