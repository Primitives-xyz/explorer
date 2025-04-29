import { useCurrentWallet } from '@/utils/use-current-wallet'
import { PerpMarkets } from '@drift-labs/sdk-browser'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useInitializeDrift } from './use-initialize-drift'
import { useMarketPrice } from './use-market-price'
import { useToastContent } from './use-toast-content'

interface UseUserStatsProps {
  subAccountId: number
  symbol: string
}

interface PerpsPositionInfoProps {
  market: string
  direction: string
  baseAssetAmountInToken: number
  baseAssetAmountInUsd: number
  entryPrice: number
  markPrice: number
  pnlInUsd: number
  pnlInPercentage: number
  liqPrice: number
}

const env = 'mainnet-beta'

export function useOpenPositions({ subAccountId, symbol }: UseUserStatsProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const { ERRORS, LOADINGS, SUCCESS } = useToastContent()
  const { price: marketPrice, loading: marketPriceLoading } = useMarketPrice({
    symbol,
  })
  const { driftClient } = useInitializeDrift()
  const [perpsPositionsInfo, setPerpsPositionsInfo] = useState<
    PerpsPositionInfoProps[]
  >([])
  const { walletAddress } = useCurrentWallet()

  const closePosition = async () => {
    try {
      if (!driftClient) {
        toast.error(
          ERRORS.DRIFT_CLIENT_INIT_ERR.title,
          ERRORS.DRIFT_CLIENT_INIT_ERR.content
        )
        return
      }

      await driftClient.subscribe()

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
      toast.loading(
        LOADINGS.CONFIRM_LOADING.title,
        LOADINGS.CONFIRM_LOADING.content
      )
      const sig = await driftClient.closePosition(
        marketInfo.marketIndex,
        undefined,
        subAccountId
      )
      toast.dismiss()
      toast.success(
        SUCCESS.CLOSE_POSITION_TX_SUCCESS.title,
        SUCCESS.CLOSE_POSITION_TX_SUCCESS.content
      )
      return sig
    } catch (error) {
      console.error(error)
      toast.dismiss()
      toast.error(ERRORS.CLOSE_POS_ERR.title, ERRORS.CLOSE_POS_ERR.content)
    }
  }

  const fetchOpenPositions = async () => {
    try {
      setLoading(true)

      if (marketPriceLoading) return

      const baseUrl = `/api/drift/perpspositions/?wallet=${walletAddress}&&subAccountId=${subAccountId}&&symbol=${symbol}&&marketPrice=${marketPrice}`

      const res = await fetch(baseUrl, {
        method: 'GET',
      })
      const data = await res.json()

      if (!data.error) {
        const perpsPositionsInfo = data.perpPositions
        setPerpsPositionsInfo(perpsPositionsInfo)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const refreshFetchOpenPositions = () => {
    if (!loading) {
      fetchOpenPositions()
    }
  }

  useEffect(() => {
    if (marketPrice && !loading) {
      fetchOpenPositions()
    }
  }, [driftClient, subAccountId, marketPrice])

  return {
    perpsPositionsInfo,
    loading,
    closePosition,
    refreshFetchOpenPositions,
  }
}
