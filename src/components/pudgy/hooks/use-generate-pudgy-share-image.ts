'use client'

import { IProfile } from '@/components/tapestry/models/profiles.models'
import { fetchWrapper } from '@/utils/api'
import { useEffect, useState } from 'react'

interface Props {
  profile: IProfile
}

export function useGeneratePudgyShareImage({ profile }: Props) {
  const [data, setData] = useState<Blob>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const generateImage = async () => {
      try {
        setLoading(true)
        setError(undefined)

        const response = await fetchWrapper<Blob>({
          endpoint: 'pudgy/share-image',
          queryParams: {
            username: profile.username,
            avatar: profile.image ?? '',
            description: profile.bio ?? '',
            pudgyTheme: profile.pudgyTheme?.toLowerCase() ?? 'blue',
          },
          isBlob: true,
        })

        setData(response)
      } catch (err) {
        setError(err as Error)
        console.error('Error generating image:', err)
      } finally {
        setLoading(false)
      }
    }

    generateImage()
  }, [profile])

  return {
    data,
    loading,
    error,
  }
}
