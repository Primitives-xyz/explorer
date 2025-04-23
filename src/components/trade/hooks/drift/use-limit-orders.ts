import {
  BN,
  convertToNumber,
  PerpMarkets,
  QUOTE_PRECISION,
} from '@drift-labs/sdk-browser'
import { useCallback, useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'
import { toast } from 'sonner'
import { useToastContent } from './use-toast-content'

interface Props {
  subAccountId: number,
  symbol: string
}

interface LimitOrderProps {
  market: string,
  direction: string,
  price: number,
  baseAssetAmount: number
  triggerPrice: number,
  orderId: number
}

const env = 'mainnet-beta'

export function useLimitOrders({
  subAccountId,
  symbol
}: Props) {
  const [loading, setLoading] = useState<boolean>(true)
  const [cancelLoading, setCancelLoading] = useState<boolean>(false)
  const { driftClient } = useInitializeDrift()
  const { ERRORS, LOADINGS, SUCCESS } = useToastContent()
  const [limitOrders, setLimitOrders] = useState<LimitOrderProps[]>([])

  const cancelOrder = async (orderId: number, subAccountId: number) => {
    if (!driftClient) {
      toast.error(ERRORS.DRIFT_CLIENT_INIT_ERR.title, ERRORS.DRIFT_CLIENT_INIT_ERR.content)
      return
    }

    await driftClient.subscribe()

    try {
      setCancelLoading(true)
      toast.loading(LOADINGS.CONFIRM_LOADING.title, LOADINGS.CONFIRM_LOADING.content)
      const sig = await driftClient.cancelOrder(orderId, undefined, subAccountId)
      toast.success(SUCCESS.CANCEL_ORDER_TX_SUCCESS.title, SUCCESS.CANCEL_ORDER_TX_SUCCESS.content)
      await refreshFetchLimitOrders()
      return sig
    } catch (error) {
      console.log(error)
      toast.error(ERRORS.CLOSE_POS_ERR.title, ERRORS.CLOSE_POS_ERR.content)
    } finally {
      toast.dismiss()
      setCancelLoading(false)
    }

  }

  const fetchLimitOrders = useCallback(async () => {
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

      const orders = user.getOpenOrders()
      let limitOrders: LimitOrderProps[] = []

      orders.forEach((order) => {
        const direction = "long" in order.direction ? "LONG" : "SHORT"
        const price = convertToNumber(order.price, QUOTE_PRECISION)
        const triggerPrice = convertToNumber(order.triggerPrice, QUOTE_PRECISION)
        const baseAssetAmount = convertToNumber(order.baseAssetAmount, new BN(10).pow(new BN(9)))
        const orderId = order.orderId

        limitOrders.push({
          market: marketInfo.symbol,
          direction,
          baseAssetAmount,
          orderId,
          price,
          triggerPrice
        })
      })

      setLimitOrders(limitOrders)
    } catch (error) {
      console.log(error)
      toast.error(ERRORS.FETCH_PERPS_POSITION_ERR.title, ERRORS.FETCH_PERPS_POSITION_ERR.content)
    } finally {
      setLoading(false)
    }
  }, [driftClient, subAccountId])

  const refreshFetchLimitOrders = async () => {
    await fetchLimitOrders()
  }

  useEffect(() => {
    const interval = setInterval(fetchLimitOrders, 10000)

    return () => clearInterval(interval)
  }, [driftClient, subAccountId])

  return {
    limitOrders,
    loading,
    cancelLoading,
    cancelOrder
  }
}