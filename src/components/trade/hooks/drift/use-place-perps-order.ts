import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  BN,
  calculateBidAskPrice,
  convertToNumber,
  getMarketOrderParams,
  OrderType,
  PerpMarkets,
  PositionDirection,
  PRICE_PRECISION,
} from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCreatePerpTradeContent } from '../use-create-perp-trade-content'
import { useInitializeDrift } from './use-initialize-drift'
import { useToastContent } from './use-toast-content'

interface UsePlacePerpsOrderParams {
  amount: string
  symbol: string
  direction: PositionDirection
  slippage?: string
  orderType: OrderType
  limitPrice: string
  reduceOnly: boolean
}

const env = 'mainnet-beta'

export function usePlacePerpsOrder({
  amount,
  symbol,
  direction,
  slippage = '0.1',
  orderType,
  limitPrice,
  reduceOnly,
}: UsePlacePerpsOrderParams) {
  const [loading, setLoading] = useState<boolean>(false)
  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const { ERRORS, LOADINGS, SUCCESS } = useToastContent()
  const { createPerpTradeContentNode } = useCreatePerpTradeContent()

  const placePerpsOrder = async () => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      toast.error(
        ERRORS.WALLET_CONNETION_ERR.title,
        ERRORS.WALLET_CONNETION_ERR.content
      )
      return
    }

    if (Number(amount) <= 0.01) {
      toast.error(
        ERRORS.PERPS_ORDER_SIZE_ERR.title,
        ERRORS.PERPS_ORDER_SIZE_ERR.content
      )
      return
    }

    setLoading(true)

    try {
      if (!driftClient) {
        toast.error(
          ERRORS.DRIFT_CLIENT_INIT_ERR.title,
          ERRORS.DRIFT_CLIENT_INIT_ERR.content
        )
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
        toast.error(
          ERRORS.PERPS_MARKET_ERR.title,
          ERRORS.PERPS_MARKET_ERR.content
        )
        return
      }

      const marketIndex = marketInfo.marketIndex
      const perpMarketAccount = driftClient.getPerpMarketAccount(marketIndex)
      if (!perpMarketAccount) {
        toast.error(
          ERRORS.PERPS_MARKET_ACCOUNT_ERR.title,
          ERRORS.PERPS_MARKET_ACCOUNT_ERR.content
        )
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

      // Convert the human‑readable `amount` (string) into Drift's perp precision (10^9).
      // e.g. "0.5" SOL => 0.5 * 1_000_000_000 = 500_000_000 (BN)
      const baseAssetAmount = driftClient.convertToPerpPrecision(Number(amount))

      const orderParams = getMarketOrderParams({
        baseAssetAmount,
        direction,
        marketIndex: perpMarketAccount.marketIndex,
      })

      // Apply slippage to the order
      if (slippageDecimal > 0) {
        // For limit price, we need to adjust based on direction
        if ('long' in direction) {
          // When going LONG, we're willing to pay up to X% more
          const maxPrice = ask
            .mul(new BN(Math.floor((1 + slippageDecimal) * 1e6)))
            .div(new BN(1e6))
          orderParams.oraclePriceOffset = convertToNumber(
            maxPrice.sub(ask),
            PRICE_PRECISION
          )
        } else {
          // When going SHORT, we're willing to receive up to X% less
          const minPrice = bid
            .mul(new BN(Math.floor((1 - slippageDecimal) * 1e6)))
            .div(new BN(1e6))
          orderParams.oraclePriceOffset = convertToNumber(
            minPrice.sub(bid),
            PRICE_PRECISION
          )
        }
      }

      if (orderType === OrderType.LIMIT) {
        const price = driftClient.convertToPricePrecision(Number(limitPrice))
        const formatedPrice = convertToNumber(price, PRICE_PRECISION)

        if (
          direction === PositionDirection.LONG &&
          formatedPrice >= formattedAskPrice
        ) {
          toast.error(
            ERRORS.LIMIT_PRICE_LONG_ERR.title,
            ERRORS.LIMIT_PRICE_LONG_ERR.content
          )
          return
        }

        if (
          direction === PositionDirection.SHORT &&
          formatedPrice < formattedAskPrice
        ) {
          toast.error(
            ERRORS.LIMIT_PRICE_SHORT_ERR.title,
            ERRORS.LIMIT_PRICE_SHORT_ERR.content
          )
          return
        }

        orderParams.price = price
        orderParams.reduceOnly = reduceOnly
      }

      toast.loading(
        LOADINGS.CONFIRM_LOADING.title,
        LOADINGS.CONFIRM_LOADING.content
      )
      const txSig = await driftClient.placePerpOrder(orderParams)

      toast.dismiss()
      toast.success(
        SUCCESS.PLACE_PERPS_ORDER_TX_SUCCESS.title,
        SUCCESS.PLACE_PERPS_ORDER_TX_SUCCESS.content
      )
      console.log('Perp order sent – tx:', txSig)

      // --- Create Content Node ---
      if (txSig) {
        createPerpTradeContentNode({
          signature: txSig,
          marketSymbol: symbol,
          marketIndex: marketIndex,
          direction: direction,
          size: amount,
          orderType: orderType,
          limitPrice: orderType === OrderType.LIMIT ? limitPrice : null,
          reduceOnly: reduceOnly,
          slippage: slippage,
          walletAddress: walletAddress,
        })
      }
      // --- End Content Node Creation ---
    } catch (error) {
      console.error('error', error)
      toast.dismiss()
      toast.error(
        ERRORS.TX_PERPS_ORDER_ERR.title,
        ERRORS.TX_PERPS_ORDER_ERR.content
      )
      return
    } finally {
      setLoading(false)
    }
  }

  return {
    placePerpsOrder,
    loading,
  }
}
