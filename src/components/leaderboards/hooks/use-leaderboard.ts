import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export interface Trader {
  address: string
  trade_count: number
  profile: {
    username: string
    image?: string
    bio?: string
  }
}

export function useLeaderboard() {
  const [traders, setTraders] = useState<Trader[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations()

  useEffect(() => {
    const fetchTopTraders = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/leaderboard`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          console.error('API Response not OK:', {
            status: response.status,
            statusText: response.statusText,
          })
          throw new Error(
            `${t('error.failed_to_fetch_top_traders')} ${response.status}`
          )
        }

        const data = await response.json()
        console.log('API Response data:', data)

        if (!data.entries || !Array.isArray(data.entries)) {
          console.error('Invalid data format:', data)
          throw new Error('Invalid data format received from API')
        }

        const transformedTraders = data.entries.map((entry: any) => ({
          address: entry.profile.wallet?.id || '',
          trade_count: entry.score || 0,
          profile: {
            username: entry.profile.username || 'Anonymous',
            image: entry.profile.image,
            bio: entry.profile.bio,
          },
        }))

        console.log('Transformed traders:', transformedTraders)
        setTraders(transformedTraders)
      } catch (err) {
        console.error(t('error.error_fetching_top_traders'), err)
        setError(
          err instanceof Error
            ? err.message
            : t('error.failed_to_fetch_traders')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopTraders()
  }, [])

  return {
    traders,
    isLoading,
    error,
  }
}
