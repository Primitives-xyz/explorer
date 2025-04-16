import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  BN,
  convertToNumber,
  PerpMarkets,
  PRICE_PRECISION,
  ZERO,
} from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { useEffect, useState } from 'react'
import { useDriftUsers } from './use-drift-users'
import { useInitializeDrift } from './use-initialize-drift'

interface UseLiquidationPriceProps {
  symbol: string
  amount: string
  direction: 'long' | 'short'
}

export function useLiquidationPrice({
  symbol,
  amount,
  direction,
}: UseLiquidationPriceProps) {
  const [liquidationPrice, setLiquidationPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const { accountIds } = useDriftUsers()
  const env = 'mainnet-beta'

  useEffect(() => {
    if (
      !driftClient ||
      !walletAddress ||
      !primaryWallet ||
      !isSolanaWallet(primaryWallet)
    ) {
      setLoading(false)
      return
    }

    const fetchLiquidationPrice = async () => {
      try {
        setLoading(true)

        // Parse amount to number first
        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
          setLiquidationPrice(null)
          setLoading(false)
          return
        }

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

        // Get user object
        const user = driftClient.getUser(accountIds[0] || 0)
        if (!user) {
          setError('User account not found')
          return
        }

        // Subscribe to user account updates
        await user.subscribe()

        // Get perpMarket for price information
        const perpMarketAccount = driftClient.getPerpMarketAccount(marketIndex)
        if (!perpMarketAccount) {
          setError('Perp market account not found')
          return
        }

        // Get the current oracle price
        const oracleData = driftClient.getOracleDataForPerpMarket(marketIndex)
        if (!oracleData) {
          setError('Oracle data not available')
          return
        }

        // Convert amount to baseAssetAmount (with precision)
        const baseAssetAmount = new BN(Math.round(amountNum * 1e9))

        // The sign depends on direction (positive for long, negative for short)
        const signedBaseAssetAmount =
          direction === 'long' ? baseAssetAmount : baseAssetAmount.neg()

        // Calculate liquidation price
        const liqPrice = user.liquidationPrice(
          marketIndex,
          signedBaseAssetAmount, // Position size change
          ZERO, // Estimated entry price - using 0 allows the SDK to use oracle price
          'Maintenance', // Margin category
          true, // Include open orders
          ZERO // Offset collateral
        )

        // Convert to human-readable format
        const liqPriceNumber = convertToNumber(liqPrice, PRICE_PRECISION)

        setLiquidationPrice(liqPriceNumber)
        setError(null)
      } catch (err) {
        console.error('Error calculating liquidation price:', err)
        setError('Failed to calculate liquidation price')
        setLiquidationPrice(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLiquidationPrice()
  }, [
    driftClient,
    primaryWallet,
    walletAddress,
    accountIds,
    symbol,
    amount,
    direction,
  ])

  return {
    liquidationPrice,
    loading,
    error,
  }
}
