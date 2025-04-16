import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  BN,
  calculateBidAskPrice,
  convertToNumber,
  getMarketOrderParams,
  PerpMarkets,
  PositionDirection,
  PRICE_PRECISION,
} from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'

interface UsePlacePerpsOrderParams {
  amount: string
  symbol: string
  direction: PositionDirection
  slippage?: string
}

const env = 'mainnet-beta'

export function usePlacePerpsOrder({
  amount,
  symbol,
  direction,
  slippage = '0.1',
}: UsePlacePerpsOrderParams) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const placePerpsOrder = async () => {
    setError(null)
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError('Wallet not connected')
      return
    }

    if (Number(amount) <= 0.01) {
      setError('Order size must be at least 0.01 SOL')
      return
    }

    setLoading(true)
    try {
      if (!driftClient) {
        setError('Drift client not initialized')
        return
      }

      // Ensure the client is subscribed (fetches required on-chain accounts)
      await driftClient.subscribe()

      // Make sure a user object is initialised and subscribed.  If an on-chain user account
      // does not yet exist, `getUser()` will still return a `User` wrapper – but we
      // need to subscribe it so that the SDK keeps the account in sync.
      const user = driftClient.getUser()
      await user.subscribe()

      const marketInfo = PerpMarkets[env].find(
        (market) => market.baseAssetSymbol === symbol
      )

      if (!marketInfo) {
        setError('Market not found')
        return
      }

      const marketIndex = marketInfo.marketIndex
      const perpMarketAccount = driftClient.getPerpMarketAccount(marketIndex)
      if (!perpMarketAccount) {
        setError('Perp market account not found')
        return
      }
      // Get vAMM bid and ask price
      const [bid, ask] = calculateBidAskPrice(
        perpMarketAccount.amm,
        driftClient.getOracleDataForPerpMarket(marketIndex)
      )

      const formattedBidPrice = convertToNumber(bid, PRICE_PRECISION)
      const formattedAskPrice = convertToNumber(ask, PRICE_PRECISION)

      // Parse slippage from percentage to decimal (0.5% -> 0.005)
      const slippageDecimal =
        slippage === 'infinity'
          ? 0.1 // Maximum slippage
          : slippage === 'zap'
          ? 0.01 // Swift-like dynamic slippage
          : parseFloat(slippage) / 100 // Regular percentage slippage

      console.log(
        env,
        `vAMM bid: $${formattedBidPrice} and ask: $${formattedAskPrice}, slippage: ${
          slippageDecimal * 100
        }%`
      )

      const solMarketAccount = driftClient.getPerpMarketAccount(
        marketInfo.marketIndex
      )

      if (!solMarketAccount) {
        setError('Sol market account not found')
        return
      }

      // Convert the human‑readable `amount` (string) into Drift's perp precision (10^9).
      // e.g. "0.5" SOL => 0.5 * 1_000_000_000 = 500_000_000 (BN)
      const baseAssetAmount = new BN(Math.round(Number(amount) * 1e9))

      const orderParams = getMarketOrderParams({
        baseAssetAmount,
        direction,
        marketIndex: solMarketAccount.marketIndex,
      })

      // Apply slippage to the order
      if (slippageDecimal > 0) {
        // For limit price, we need to adjust based on direction
        if (direction === PositionDirection.LONG) {
          // When going LONG, we're willing to pay up to X% more
          const maxPrice = ask
            .mul(new BN(Math.floor((1 + slippageDecimal) * 1e6)))
            .div(new BN(1e6))
          orderParams.oraclePriceOffset = maxPrice.sub(ask).toNumber()
        } else {
          // When going SHORT, we're willing to receive up to X% less
          const minPrice = bid
            .mul(new BN(Math.floor((1 - slippageDecimal) * 1e6)))
            .div(new BN(1e6))
          orderParams.oraclePriceOffset = minPrice.sub(bid).toNumber()
        }
      }

      const txSig = await driftClient.placePerpOrder(orderParams)

      console.log('Perp order sent – tx:', txSig)
    } catch (error) {
      setError(`Failed to Place Perps Order.\nPlease try again later.`)
      console.log(error)
      return
    } finally {
      setLoading(false)
    }
  }

  return {
    placePerpsOrder,
    loading,
    error,
    setError,
  }
}
