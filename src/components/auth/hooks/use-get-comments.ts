import { useState, useEffect } from 'react'

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
        console.log('- A -')
        const data = await fetch(url)
        console.log('- B -')
        const response = await data.json()
        console.log('- C -')
        console.log('response::::::', response)
        setComments(response)
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
