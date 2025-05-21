'use client'

import { useEffect, useState } from 'react'

interface GenerateImageParams {
  username: string
  score: number
  profileImage: string
  badges: string[]
}

export function useGenerateSolidScoreImage(params: GenerateImageParams | null) {
  const [data, setData] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const generateImage = async () => {
      if (!params || !params.score || !params.username) {
        return
      }

      try {
        setLoading(true)
        setError(null)

        const searchParams = new URLSearchParams({
          username: params.username,
          score: params.score.toString(),
          profileImage: params.profileImage,
          badges: JSON.stringify(params.badges),
        })

        const response = await fetch(`/api/og/solid-score?${searchParams}`)

        if (!response.ok) {
          throw new Error('Failed to generate image')
        }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.username, params?.score, params?.profileImage, params?.badges])

  return { data, loading, error }
}
