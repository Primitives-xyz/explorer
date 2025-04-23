import {
  BN,
  convertToNumber,
  PerpMarkets,
  PRICE_PRECISION,
  QUOTE_PRECISION,
} from '@drift-labs/sdk-browser'
import { useCallback, useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'
import { useMarketPrice } from './use-market-price'
import { toast } from 'sonner'
import { useToastContent } from './use-toast-content'

interface UseUserStatsProps {
  subAccountId: number,
  symbol: string
}

interface PerpsPositionInfoProps {
  market: string,
  direction: string,
  baseAssetAmountInToken: number
  baseAssetAmountInUsd: number
  entryPrice: number
  markPrice: number
  pnlInUsd: number
  pnlInPercentage: number
  liqPrice: number
}

const env = 'mainnet-beta'

export function useOpenPositions({
  subAccountId,
  symbol
}: UseUserStatsProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const { ERRORS } = useToastContent()
  const { price: marketPrice } = useMarketPrice({ symbol })
  const { driftClient } = useInitializeDrift()
  const [perpsPositionsInfo, setPerpsPositionsInfo] = useState<PerpsPositionInfoProps[]>([])

  const closePosition = async () => {
    if (!driftClient) {
      toast.error(ERRORS.DRIFT_CLIENT_INIT_ERR.title, ERRORS.DRIFT_CLIENT_INIT_ERR.content)
      return
    }

    const marketInfo = PerpMarkets[env].find(
      (market) => market.baseAssetSymbol === symbol
    )

    if (!marketInfo) {
      toast.error(ERRORS.PERPS_MARKET_ERR.title, ERRORS.PERPS_MARKET_ERR.content)
      return
    }

    const sig = await driftClient.closePosition(marketInfo.marketIndex, undefined, subAccountId)
    return sig
  }

  const fetchOpenPositions = useCallback(async () => {
    setLoading(true)
    try {
      if (!driftClient) {
        toast.error(ERRORS.DRIFT_CLIENT_INIT_ERR.title, ERRORS.DRIFT_CLIENT_INIT_ERR.content)
        return
      }

      await driftClient.subscribe()

      const marketInfo = PerpMarkets[env].find(
        (market) => market.baseAssetSymbol === symbol
      )

      if (!marketInfo) {
        toast.error(ERRORS.PERPS_MARKET_ERR.title, ERRORS.PERPS_MARKET_ERR.content)
        return
      }

      const user = driftClient.getUser(subAccountId)

      if (!user) {
        toast.error(ERRORS.PERPS_USER_ERR.title, ERRORS.PERPS_USER_ERR.content)
        return
      }

      await user.subscribe()
      const perpPositions = user.getActivePerpPositions()
      const liqPrice = convertToNumber(user.liquidationPrice(marketInfo.marketIndex), PRICE_PRECISION)
      let perpsPositionsInfo: PerpsPositionInfoProps[] = []

      perpPositions.forEach((position) => {
        const baseAssetAmount = convertToNumber(position.baseAssetAmount, new BN(10).pow(new BN(9)))
        const quoteAssetAmount = convertToNumber(position.quoteAssetAmount, QUOTE_PRECISION)
        const entryPrice = Math.abs(quoteAssetAmount / baseAssetAmount)
        const unrealizedPnL = (marketPrice - entryPrice) * baseAssetAmount
        const unrealizedPnlPercentage = unrealizedPnL / (baseAssetAmount * marketPrice) * 100

        if (baseAssetAmount) {
          perpsPositionsInfo.push({
            market: marketInfo.symbol,
            direction: baseAssetAmount > 0 ? "LONG" : "SHORT",
            baseAssetAmountInToken: Math.abs(baseAssetAmount),
            baseAssetAmountInUsd: Math.abs(baseAssetAmount * marketPrice),
            entryPrice: entryPrice,
            markPrice: marketPrice,
            pnlInUsd: unrealizedPnL,
            pnlInPercentage: unrealizedPnlPercentage,
            liqPrice: liqPrice
          })
        }
      })

      setPerpsPositionsInfo(perpsPositionsInfo)
    } catch (error) {
      console.log(error)
      toast.error(ERRORS.FETCH_PERPS_POSITION_ERR.title, ERRORS.FETCH_PERPS_POSITION_ERR.content)
    } finally {
      setLoading(false)
    }
  }, [driftClient, subAccountId, marketPrice])

  const refreshFetchOpenPositions = () => {
    setLoading(false)
    fetchOpenPositions()
  }

  useEffect(() => {
    if (marketPrice) {
      fetchOpenPositions()
    }
  }, [driftClient, subAccountId, marketPrice])

  return {
    perpsPositionsInfo,
    loading,
    closePosition,
    refreshFetchOpenPositions
  }
}