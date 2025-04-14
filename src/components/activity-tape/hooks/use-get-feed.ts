import { useQuery } from '@/components/utils/api'
import { useMemo } from 'react'
import { IActivityTapeEntry, IGetFeedResponse } from '../activity-tape.models'

export function useGetFeed() {
  const { data } = useQuery<IGetFeedResponse>({
    endpoint: 'feed',
  })

  const transactions: IActivityTapeEntry[] = useMemo(() => {
    return (
      data?.transactions?.map((entry) => ({
        type: entry.type,
        text: `${
          entry.username ||
          (entry.walletAddress
            ? entry.walletAddress.slice(0, 4) +
              '...' +
              entry.walletAddress.slice(-4)
            : '')
        } bought`,
        action: '💱',
        wallet: entry.username || entry.walletAddress,
        timestamp: Math.floor(new Date(entry.timestamp).getTime()),
        highlight: 'positive',
        amount: `${entry.to.amount.toFixed(2)} `,
        amountSuffix: 'SSE',
        isSSEBuy: true,
        signature: entry.signature,
      })) ?? []
    )
  }, [data])

  return {
    transactions,
  }
}
