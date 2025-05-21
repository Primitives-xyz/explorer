'use client'

import { useEffect, useState } from 'react'

interface UseGenerateSolidScoreImageParams {
  username: string
  score: number
  profileImage: string
  badges: string[]
}

export function useGenerateSolidScoreImage(
  params: UseGenerateSolidScoreImageParams
) {
  const [data, setData] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const generateImage = async () => {
      try {
        setLoading(true)
        setError(null)

        const searchParams = new URLSearchParams()
        searchParams.set('username', params.username)
        searchParams.set('score', params.score.toString())
        if (params.profileImage) {
          searchParams.set(
            'profileImage',
            encodeURIComponent(params.profileImage)
          )
        }
        if (params.badges.length > 0) {
          searchParams.set('badges', JSON.stringify(params.badges))
        }

        const response = await fetch(
          `/api/og/solid-score?${searchParams.toString()}`
        )
        const blob = await response.blob()
        setData(blob)
      } catch (err) {
        setError(err as Error)
        console.error('Error generating image:', err)
      } finally {
        setLoading(false)
      }
    }

    generateImage()
  }, [params.username, params.score, params.profileImage, params.badges])

  return { data, loading, error }
}
