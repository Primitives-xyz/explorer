import { convertToNumber, PerpMarkets, QUOTE_PRECISION } from '@drift-labs/sdk-browser'
import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'

interface UseOraclePriceProps {
  symbol: string
}

export function useOraclePrice({ symbol }: UseOraclePriceProps) {
  const [oraclePrice, setOraclePrice] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()

  useEffect(() => {
    const fetchOraclePrice = async () => {
      try {
        setLoading(true)
        if (!driftClient || !symbol) {
          return
        }
        await driftClient.subscribe()

        const marketInfo = PerpMarkets['mainnet-beta'].find(
          (market) => market.baseAssetSymbol === symbol
        )

        if (!marketInfo) return

        const oraclePriceData = driftClient.getOracleDataForPerpMarket(
          marketInfo.marketIndex
        )

        setOraclePrice(convertToNumber(oraclePriceData.price, QUOTE_PRECISION))
      } catch (err) {
        console.error('Error fetching oracle price:', err)
        setError('Failed to fetch oracle price')
      } finally {
        setLoading(false)
      }
    }

    fetchOraclePrice()
  }, [driftClient, symbol])

  return {
    oraclePrice,
    loading,
    error,
  }
}
