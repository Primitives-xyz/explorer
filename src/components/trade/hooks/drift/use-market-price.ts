import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'

interface UseMarketPriceProps {
  symbol: string
}

export function useMarketPrice({ symbol }: UseMarketPriceProps) {
  const [price, setPrice] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const env = 'mainnet-beta'

  useEffect(() => {
    if (!driftClient || !symbol) {
      return
    }

    const fetchMarketPrice = async () => {
      try {
        setLoading(true)

        const baseUrl = `/api/drift/marketprice/?symbol=${symbol}`

        const res = await fetch(baseUrl, {
          method: 'GET',
        })
        const data = await res.json()

        if (!data.error) {
          const marketPrice = data.marketPrice
          setPrice(marketPrice)
          setError(null)
        } else {
          setError(data.error)
        }
      } catch (err) {
        console.error('Error fetching market price:', err)
        setError('Failed to fetch market price')
      } finally {
        setLoading(false)
      }
    }

    fetchMarketPrice()

    // Set up interval to refresh price every 10 seconds
    const interval = setInterval(fetchMarketPrice, 10000)

    return () => clearInterval(interval)
  }, [driftClient, symbol])

  return {
    price,
    loading,
    error,
  }
}
