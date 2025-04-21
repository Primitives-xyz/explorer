import { IUserStats } from '@/components/tapestry/models/drift.model'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  convertToNumber,
  PositionDirection,
  QUOTE_PRECISION,
  TEN_THOUSAND,
} from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'

export function useUserStats(subAccountId = 0) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<IUserStats>({
    health: 0,
    healthRatio: null,
    netUsdValue: 0,
    leverage: 0,
    perpPositions: [],
    spotPositions: [],
    maxLeverage: 0,
    maxTradeSize: 0,
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
        const spotPositions = user.getActiveSpotPositions()

        // Get net USD value (total account value)
        const totalAccountValue = convertToNumber(
          user.getTotalCollateral(),
          QUOTE_PRECISION
        )

        // Estimate leverage from positions and collateral
        const totalPositionNotionalValue = perpPositions.reduce(
          (total, position) => {
            return total + Math.abs(position.baseAssetAmount.toNumber())
          },
          0
        )
        const leverage =
          totalAccountValue > 0
            ? totalPositionNotionalValue / totalAccountValue
            : 0

        const maxTradeSizeUSDCForPerp = user.getMaxTradeSizeUSDCForPerp(
          0,
          PositionDirection.LONG
        )
        const maxTradeSize = convertToNumber(
          maxTradeSizeUSDCForPerp.tradeSize,
          QUOTE_PRECISION
        )

        const maxLeverageForPerp = user.getMaxLeverageForPerp(0)
        const maxLeverage = convertToNumber(maxLeverageForPerp, TEN_THOUSAND)
        // Update state with fetched data
        setUserStats({
          health,
          healthRatio,
          netUsdValue: totalAccountValue,
          leverage: leverage || 0,
          perpPositions,
          spotPositions,
          maxLeverage: maxLeverage, // Drift max leverage is usually 20x
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

    // Set up periodic refresh (every 10 seconds)
    const interval = setInterval(fetchUserStats, 10000)

    return () => clearInterval(interval)
  }, [driftClient, primaryWallet, walletAddress, subAccountId])

  return {
    userStats,
    loading,
    error,
  }
}
