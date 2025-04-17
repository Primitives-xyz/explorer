import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  convertToNumber,
  PerpPosition,
  QUOTE_PRECISION,
  SpotPosition,
} from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'

export interface IUserStats {
  // User health
  health: number
  healthRatio: number | null

  // Net USD Value
  netUsdValue: number

  // Leverage
  leverage: number

  // Positions
  perpPositions: PerpPosition[]
  spotPositions: SpotPosition[]

  // Trading limits
  maxLeverage: number
  maxTradeSize: number
}

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

        // User doesn't have getMaxTradeSize in this SDK version
        // We'll estimate based on available margin and max leverage
        // Using a simple estimate - 20x the total collateral minus existing positions
        const maxTradeSize = totalAccountValue * 20 - totalPositionNotionalValue

        // Update state with fetched data
        setUserStats({
          health,
          healthRatio,
          netUsdValue: totalAccountValue,
          leverage: leverage || 0,
          perpPositions,
          spotPositions,
          maxLeverage: 20, // Drift max leverage is usually 20x
          maxTradeSize: maxTradeSize,
        })

        setError(null)
      } catch (error) {
        console.error('Error fetching user stats:', error)
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
