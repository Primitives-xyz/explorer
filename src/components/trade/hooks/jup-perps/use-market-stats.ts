import { useEffect, useState } from 'react'

interface MarketStats {
  price: string
  priceChange24H: string
  priceHigh24H: string
  priceLow24H: string
  volume: string
}

export const useMarketStats = (mint: string) => {
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          `/api/jupiter/perps/market-stats?mint=${mint}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch market stats')
        }

        const marketStats = await response.json()
        setMarketStats(marketStats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    const interval = setInterval(fetchMarketStats, 3000)

    return () => clearInterval(interval)
  }, [mint])

  return {
    marketStats,
    isLoading,
    error,
  }
}
