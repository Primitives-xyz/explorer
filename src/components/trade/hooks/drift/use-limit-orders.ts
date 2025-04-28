import { useCallback, useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'
import { toast } from 'sonner'
import { useToastContent } from './use-toast-content'
import { useCurrentWallet } from '@/utils/use-current-wallet'

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

export function useLimitOrders({
  subAccountId,
  symbol
}: Props) {
  const [loading, setLoading] = useState<boolean>(false)
  const [cancelLoading, setCancelLoading] = useState<boolean>(false)
  const { driftClient } = useInitializeDrift()
  const { ERRORS, LOADINGS, SUCCESS } = useToastContent()
  const [limitOrders, setLimitOrders] = useState<LimitOrderProps[]>([])
  const { walletAddress } = useCurrentWallet()

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
      refreshFetchLimitOrders()
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
    try {
      setLoading(true)

      const baseUrl = `/api/drift/limitorders/?wallet=${walletAddress}&&subAccountId=${subAccountId}&&symbol=${symbol}`

      const res = await fetch(baseUrl, {
        method: 'GET'
      })
      const data = await res.json()

      if (!data.error) {
        const limitOrders = data.limitOrders
        setLimitOrders(limitOrders)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [driftClient, subAccountId])

  const refreshFetchLimitOrders = () => {
    if (!loading) {
      fetchLimitOrders()
    }
  }

  useEffect(() => {
    const interval = setInterval(fetchLimitOrders, 5000)

    return () => clearInterval(interval)
  }, [driftClient, subAccountId])

  return {
    limitOrders,
    loading,
    cancelLoading,
    cancelOrder,
    refreshFetchLimitOrders
  }
}