import {
  convertToNumber,
  PerpMarkets,
  PRICE_PRECISION,
} from '@drift-labs/sdk-browser'
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

        // Find the market for the requested symbol
        const marketInfo = PerpMarkets[env].find(
          (market) => market.baseAssetSymbol === symbol
        )

        if (!marketInfo) {
          setError('Market not found')
          return
        }

        // Ensure client is subscribed
        await driftClient.subscribe()

        // Get the market index
        const marketIndex = marketInfo.marketIndex

        // Get oracle price data
        const oraclePriceData =
          driftClient.getOracleDataForPerpMarket(marketIndex)
        if (!oraclePriceData) {
          setError('Oracle price data not available')
          return
        }

        // Convert price to human-readable format
        const priceValue = convertToNumber(
          oraclePriceData.price,
          PRICE_PRECISION
        )

        setPrice(priceValue)
        setError(null)
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
