import { ITrendingToken } from '@/components-new-version/models/token.models'
import { useEffect, useState } from 'react'

export const useTrendingTokens = () => {
  const [tokens, setTokens] = useState<ITrendingToken[]>([])
  const [loading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          `https://public-api.birdeye.so/defi/token_trending?sort_by=volume24hUSD&sort_type=desc&offset=0&limit=20`,
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              'x-chain': 'solana',
              'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch trending tokens')
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error('API request failed')
        }

        setTokens(data.data.tokens)
      } catch (err) {
        console.error('Error fetching trending tokens:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingTokens()
  }, [])

  return { tokens, loading, error }
}
