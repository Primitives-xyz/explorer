import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDriftUsers } from './use-drift-users'
import { useInitializeDrift } from './use-initialize-drift'
import { useToastContent } from './use-toast-content'
import { useDriftUsers } from './use-drift-users'

interface UseUserStatsProps {
  subAccountId: number
}

export interface PerpsPositionInfoProps {
  market: string
  marketIndex: number
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

export function useOpenPositions({ subAccountId }: UseUserStatsProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const { ERRORS, LOADINGS, SUCCESS } = useToastContent()
  const { driftClient } = useInitializeDrift()
  const { accountIds } = useDriftUsers()
  const [perpsPositionsInfo, setPerpsPositionsInfo] = useState<
    PerpsPositionInfoProps[]
  >([])
  const { walletAddress, isLoggedIn } = useCurrentWallet()

  const closePosition = async (marketIndex: number) => {
    try {
      if (!driftClient) {
        toast.error(
          ERRORS.DRIFT_CLIENT_INIT_ERR.title,
          ERRORS.DRIFT_CLIENT_INIT_ERR.content
        )
        return
      }

      await driftClient.subscribe()

      toast.loading(
        LOADINGS.CONFIRM_LOADING.title,
        LOADINGS.CONFIRM_LOADING.content
      )
      const sig = await driftClient.closePosition(
        marketIndex,
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
      if (!isLoggedIn || !driftClient) return
      if (!accountIds.length) return

      setLoading(true)

      const baseUrl = `/api/drift/perpspositions/?wallet=${walletAddress}&subAccountId=${subAccountId}`

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
    const interval = setInterval(() => {
      if (!loading) {
        fetchOpenPositions()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [driftClient, subAccountId, accountIds])

  return {
    perpsPositionsInfo,
    loading,
    closePosition,
    refreshFetchOpenPositions,
  }
}
