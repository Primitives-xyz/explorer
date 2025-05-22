'use client'

import { OrderType } from '@/components/tapestry/models/drift.model'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  BN,
  calculateBidAskPrice,
  convertToNumber,
  getLimitOrderParams,
  getMarketOrderParams,
  getTriggerLimitOrderParams,
  getTriggerMarketOrderParams,
  OrderTriggerCondition,
  PerpMarkets,
  PositionDirection,
  PRICE_PRECISION,
} from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCreatePerpTradeContent } from '../use-create-perp-trade-content'
import { useInitializeDrift } from './use-initialize-drift'
import { useToastContent } from './use-toast-content'

export interface UsePlacePerpsOrderParams {
  amount: string
  symbol: string
  direction: PositionDirection
  orderType: OrderType
  currentPositionDirection?: string
  slippage?: string
  limitPrice?: string
  triggerPrice?: string
  reduceOnly?: boolean
}

const env = 'mainnet-beta'

export function usePlacePerpsOrder({
  amount,
  symbol,
  direction,
  currentPositionDirection,
  slippage = '0.1',
  orderType,
  limitPrice,
  triggerPrice,
  reduceOnly,
}: UsePlacePerpsOrderParams) {
  const [loading, setLoading] = useState<boolean>(false)
  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const { ERRORS, LOADINGS, SUCCESS } = useToastContent()
  const { createPerpTradeContentNode } = useCreatePerpTradeContent()
  const pathname = usePathname()

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

      await driftClient.subscribe()
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

      let orderParams
      if (orderType === OrderType.MARKET) {
        console.log('OrderType:', orderType)
        orderParams = getMarketOrderParams({
          baseAssetAmount,
          direction,
          marketIndex: perpMarketAccount.marketIndex,
        })

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
      }

      if (orderType === OrderType.LIMIT) {
        console.log('OrderType:', orderType)
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

        orderParams = getLimitOrderParams({
          baseAssetAmount,
          direction,
          marketIndex: perpMarketAccount.marketIndex,
          price,
          reduceOnly,
        })

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
      }

      if (orderType === OrderType.TP) {
        console.log('OrderType:', orderType)
        const price = driftClient.convertToPricePrecision(Number(triggerPrice))

        if (direction === PositionDirection.LONG) {
          orderParams = getTriggerMarketOrderParams({
            marketIndex: perpMarketAccount.marketIndex,
            direction: PositionDirection.LONG,
            baseAssetAmount,
            triggerPrice: price,
            triggerCondition: OrderTriggerCondition.BELOW,
          })
        }

        if (direction === PositionDirection.SHORT) {
          orderParams = getTriggerMarketOrderParams({
            marketIndex: perpMarketAccount.marketIndex,
            direction: PositionDirection.SHORT,
            baseAssetAmount,
            triggerPrice: price,
            triggerCondition: OrderTriggerCondition.ABOVE,
          })
        }
      }

      if (orderType === OrderType.ADD_TP) {
        console.log('OrderType:', orderType)
        const price = driftClient.convertToPricePrecision(Number(triggerPrice))

        if (direction === PositionDirection.SHORT) {
          orderParams = getTriggerMarketOrderParams({
            marketIndex: perpMarketAccount.marketIndex,
            direction: PositionDirection.LONG,
            baseAssetAmount,
            triggerPrice: price,
            triggerCondition: OrderTriggerCondition.BELOW,
          })
        }

        if (direction === PositionDirection.LONG) {
          orderParams = getTriggerMarketOrderParams({
            marketIndex: perpMarketAccount.marketIndex,
            direction: PositionDirection.SHORT,
            baseAssetAmount,
            triggerPrice: price,
            triggerCondition: OrderTriggerCondition.ABOVE,
          })
        }
      }

      if (orderType === OrderType.SL) {
        console.log('OrderType:', orderType)
        const tprice = driftClient.convertToPricePrecision(Number(triggerPrice))
        const lprice = driftClient.convertToPricePrecision(Number(limitPrice))

        if (direction === PositionDirection.LONG) {
          orderParams = getTriggerLimitOrderParams({
            marketIndex: perpMarketAccount.marketIndex,
            direction: PositionDirection.LONG,
            baseAssetAmount,
            price: lprice,
            triggerPrice: tprice,
            triggerCondition: OrderTriggerCondition.ABOVE,
          })
        }

        if (direction === PositionDirection.SHORT) {
          orderParams = getTriggerMarketOrderParams({
            marketIndex: perpMarketAccount.marketIndex,
            direction: PositionDirection.SHORT,
            baseAssetAmount,
            price: lprice,
            triggerPrice: tprice,
            triggerCondition: OrderTriggerCondition.BELOW,
          })
        }
      }

      if (orderType === OrderType.ADD_SL) {
        console.log('OrderType:', orderType)
        const tprice = driftClient.convertToPricePrecision(Number(triggerPrice))
        const lprice = driftClient.convertToPricePrecision(Number(limitPrice))

        if (direction === PositionDirection.SHORT) {
          orderParams = getTriggerLimitOrderParams({
            marketIndex: perpMarketAccount.marketIndex,
            direction: PositionDirection.LONG,
            baseAssetAmount,
            price: lprice,
            triggerPrice: tprice,
            triggerCondition: OrderTriggerCondition.ABOVE,
          })
        }

        if (direction === PositionDirection.LONG) {
          orderParams = getTriggerMarketOrderParams({
            marketIndex: perpMarketAccount.marketIndex,
            direction: PositionDirection.SHORT,
            baseAssetAmount,
            price: lprice,
            triggerPrice: tprice,
            triggerCondition: OrderTriggerCondition.BELOW,
          })
        }
      }

      toast.loading(
        LOADINGS.CONFIRM_LOADING.title,
        LOADINGS.CONFIRM_LOADING.content
      )

      if (!orderParams) {
        toast.error(
          ERRORS.TX_PERPS_ORDER_ERR.title,
          ERRORS.TX_PERPS_ORDER_ERR.content
        )
        return
      }

      const txSig = await driftClient.placePerpOrder(orderParams)

      toast.dismiss()
      toast.success(
        SUCCESS.PLACE_PERPS_ORDER_TX_SUCCESS.title,
        SUCCESS.PLACE_PERPS_ORDER_TX_SUCCESS.content
      )
      console.log('Perp order sent – tx:', txSig)

      // --- Create Content Node ---
      if (txSig) {
        const route = (() => {
          const path = pathname
          if (path.includes('/trenches')) return 'trenches'
          if (path.includes('/trade')) return 'trade'
          return 'home'
        })()
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
          route,
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
