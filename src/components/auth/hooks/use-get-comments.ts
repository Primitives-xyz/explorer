import { useState, useEffect } from 'react'

const fetcher = async (url: string) => {
  console.log('Fetcher called with URL:', url) // Debug log
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch comments: ${res.statusText}`)
  }
  return res.json()
}

export const useGetComments = ({
  targetProfileId,
  requestingProfileId,
}: {
  targetProfileId: string | null
  requestingProfileId: string | null
}) => {
  console.log('Hook called with:', { targetProfileId, requestingProfileId }) // Debug log
  const [comments, setComments] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      if (!targetProfileId || !requestingProfileId) return

      const url = `/api/comments?targetProfileId=${targetProfileId}&profileId=${requestingProfileId}`
      console.log('Constructed URL:', url) // Debug log

      setIsLoading(true)
      try {
        const data = await fetcher(url)
        setComments(data)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch comments'),
        )
        setComments(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [targetProfileId, requestingProfileId])

  return { comments, loading: isLoading, error }
}

// Export a function to manually trigger refresh
export const refreshComments = async (
  targetProfileId: string,
  requestingProfileId: string,
) => {
  const url = `/api/comments?targetProfileId=${targetProfileId}&profileId=${requestingProfileId}`
  const data = await fetcher(url)
  return data
}
