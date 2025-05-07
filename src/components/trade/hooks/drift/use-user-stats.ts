import { IUserStats } from '@/components/tapestry/models/drift.model'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  convertToNumber,
  PerpMarkets,
  PositionDirection,
  QUOTE_PRECISION,
  TEN_THOUSAND,
} from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'
import { useMarketPrice } from './use-market-price'

interface UseUserStatsProps {
  subAccountId: number
  symbol: string
}

export function useUserStats({ subAccountId, symbol }: UseUserStatsProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<IUserStats>({
    health: 0,
    healthRatio: null,
    netUsdValue: 0,
    leverage: 0,
    perpPositions: [],
    orders: [],
    maxLeverage: 0,
    maxTradeSize: 0,
  })
  const { price: marketPrice, loading: priceLoading } = useMarketPrice({
    symbol,
  })

  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()

  useEffect(() => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError('Wallet not connected')
      setLoading(false)
      return
    }

    if (!driftClient) {
      setError('Drift client not initialized')
      setLoading(false)
      return
    }

    const fetchUserStats = async () => {
      try {
        setLoading(true)

        // Ensure client is subscribed
        await driftClient.subscribe()

        // Get user account
        const user = driftClient.getUser(subAccountId)
        if (!user) {
          setError('User account not found')
          setLoading(false)
          return
        }
        // Subscribe to user account updates
        await user.subscribe()
        // Get user health and positions
        const health = user.getHealth()
        // The healthRatio is health/maintenance requirement (user.getHealthRatioEntry() is in SDK >= 2.20)
        const healthRatio = health / 100
        const perpPositions = user.getActivePerpPositions()
        const orders = user.getOpenOrders()
        const currentLeverage = user.getLeverage(true)

        // Get net USD value (total account value)
        const netUsdValue = convertToNumber(
          user.getNetUsdValue(),
          QUOTE_PRECISION
        )

        const maxTradeSizeUSDCForPerp = user.getMaxTradeSizeUSDCForPerp(
          0,
          PositionDirection.LONG
        )
        const maxTradeSize = convertToNumber(
          maxTradeSizeUSDCForPerp.tradeSize,
          QUOTE_PRECISION
        )

        const marketInfo = PerpMarkets['mainnet-beta'].find(
          (market) => market.baseAssetSymbol === symbol
        )

        if (!marketInfo) return
        console.log("marketIndex:", marketInfo.marketIndex)

        const maxLeverageForPerp = user.getMaxLeverageForPerp(
          marketInfo.marketIndex
        )
        const maxLeverage = convertToNumber(maxLeverageForPerp, TEN_THOUSAND)
        // Update state with fetched data
        setUserStats({
          health,
          healthRatio,
          netUsdValue,
          leverage: convertToNumber(currentLeverage, TEN_THOUSAND),
          perpPositions,
          orders,
          maxLeverage: maxLeverage,
          maxTradeSize: maxTradeSize,
        })

        setError(null)
      } catch (error) {
        setError('Failed to fetch user stats')
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [
    driftClient,
    primaryWallet,
    walletAddress,
    subAccountId,
    marketPrice,
    symbol,
  ])

  return {
    userStats,
    loading,
    error,
  }
}
