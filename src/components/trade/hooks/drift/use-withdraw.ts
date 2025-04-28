import {
  BN,
  convertToBN,
  PRICE_PRECISION,
  SpotMarkets,
} from '@drift-labs/sdk-browser'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useInitializeDrift } from './use-initialize-drift'
import { useToastContent } from './use-toast-content'

interface UseWithdrawProps {
  subAccountId: number
  tokenSymbol: string
}

export function useWithdraw({ subAccountId, tokenSymbol }: UseWithdrawProps) {
  const { LOADINGS, SUCCESS, ERRORS } = useToastContent()
  const [loading, setLoading] = useState<boolean>(false)
  const [withdrawalLimitLoading, setWithdrawalLimitLoading] =
    useState<boolean>(false)
  const { driftClient } = useInitializeDrift()
  const marketInfo = useMemo(() => {
    return SpotMarkets['mainnet-beta'].find(
      (market) => market.symbol === tokenSymbol
    )
  }, [tokenSymbol])
  const [withdrawalLimit, setWithdrawalLimit] = useState<BN>(new BN(0))
  const [precision, setPrecision] = useState<BN>(PRICE_PRECISION)

  const withdraw = async (amount: string) => {
    try {
      console.log('amount:', amount)
      setLoading(true)

      if (!driftClient) {
        console.log('No Drift Client')
        return
      }

      if (!marketInfo) {
        console.log('No Market')
        return
      }

      await driftClient.subscribe()
      const marketIndex = marketInfo.marketIndex
      const associatedTokenAccount =
        await driftClient.getAssociatedTokenAccount(marketIndex)
      const bnAmount = convertToBN(Number(amount), precision)
      toast.loading(
        LOADINGS.CONFIRM_LOADING.title,
        LOADINGS.CONFIRM_LOADING.content
      )
      await driftClient.withdraw(bnAmount, marketIndex, associatedTokenAccount)
      toast.dismiss()
      toast.success(
        SUCCESS.PERPS_WITHDRAW_SUCCESS.title,
        SUCCESS.PERPS_WITHDRAW_SUCCESS.content
      )
      refreshFetchWithdrawalLimit()
    } catch (error) {
      console.log(error)
      toast.dismiss()
      toast.error(
        ERRORS.WITHDRAW_DEPOSIT_TX_ERR.title,
        ERRORS.WITHDRAW_DEPOSIT_TX_ERR.content
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchWithdrawalLimit = async () => {
    try {
      setWithdrawalLimitLoading(true)

      if (!driftClient) {
        console.log('No Drift Client')
        return
      }

      if (!marketInfo) {
        console.log('No Market')
        return
      }

      setPrecision(marketInfo.precision)

      await driftClient.subscribe()
      const user = driftClient.getUser(subAccountId)
      const withdrawalLimit = user.getWithdrawalLimit(
        marketInfo.marketIndex,
        true
      )
      setWithdrawalLimit(withdrawalLimit)
    } catch (error) {
      console.error(error)
    } finally {
      setWithdrawalLimitLoading(false)
    }
  }

  const refreshFetchWithdrawalLimit = () => {
    fetchWithdrawalLimit()
  }

  useEffect(() => {
    fetchWithdrawalLimit()
  }, [subAccountId, driftClient, tokenSymbol])

  return {
    loading,
    withdrawalLimit,
    withdrawalLimitLoading,
    precision,
    withdraw,
    refreshFetchWithdrawalLimit,
  }
}
