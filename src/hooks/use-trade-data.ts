import { TradeLogData } from '@/app/api/trades/log/route'
import { useMutation } from '@/utils/api'
import { mutate } from 'swr'

// Hook to log trades
export function useLogTrade() {
  const {
    mutate: logTrade,
    loading,
    error,
    data,
  } = useMutation<
    { success: boolean; tradeId: string; message: string },
    TradeLogData
  >({
    endpoint: 'trades/log',
  })

  const logTradeWithInvalidation = async (tradeData: TradeLogData) => {
    try {
      const result = await logTrade(tradeData)

      // Invalidate related SWR cache keys to ensure fresh data
      if (tradeData.walletAddress) {
        // Invalidate PnL cache
        mutate((key) => {
          if (typeof key === 'string') {
            return (
              key.includes('trades/pnl') &&
              key.includes(tradeData.walletAddress!)
            )
          }
          return false
        })

        // Invalidate positions cache
        mutate((key) => {
          if (typeof key === 'string') {
            return (
              key.includes('trades/positions') &&
              key.includes(tradeData.walletAddress!)
            )
          }
          return false
        })

        // Invalidate history cache
        mutate((key) => {
          if (typeof key === 'string') {
            return (
              key.includes('trades/history') &&
              key.includes(tradeData.walletAddress!)
            )
          }
          return false
        })

        // Invalidate transaction history cache
        mutate((key) => {
          if (typeof key === 'string') {
            return (
              key.includes('trades/fetch-transaction-history') &&
              key.includes(tradeData.walletAddress!)
            )
          }
          return false
        })
      }

      return result
    } catch (err) {
      throw err
    }
  }

  return {
    logTrade: logTradeWithInvalidation,
    isLoading: loading,
    error,
    data,
  }
}
