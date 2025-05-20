import { SSE_TOKEN_MINT } from '@/constants/jupiter'
import { useEffect, useState } from 'react'
import { IActivityTapeEntry, IGetFeedResponse } from '../activity-tape.models'

export function useSseFeed() {
  const [transactions, setTransactions] = useState<IActivityTapeEntry[]>([])

  useEffect(() => {
    const eventSource = new EventSource('/api/feed/sse')

    eventSource.onmessage = (event) => {
      const data: IGetFeedResponse = JSON.parse(event.data)

      const newTransactions = data.transactions.map((entry) => ({
        type: entry.type,
        text: `${
          entry.username ||
          (entry.walletAddress
            ? entry.walletAddress.slice(0, 4) +
              '...' +
              entry.walletAddress.slice(-4)
            : '')
        } ${
          entry.to.token === entry.from.token
            ? 'transferred'
            : entry.to.token === SSE_TOKEN_MINT
            ? 'bought'
            : 'sold'
        } SSE`,
        action: '💱',
        wallet: entry.username || entry.walletAddress,
        timestamp: Math.floor(new Date(entry.timestamp).getTime()),
        highlight: entry.to.token === SSE_TOKEN_MINT ? 'positive' : 'negative',
        amount: `${
          entry.to.token === SSE_TOKEN_MINT
            ? entry.to.amount.toFixed(2)
            : entry.from.amount.toFixed(2)
        }`,
        amountSuffix: 'SSE',
        isSSEBuy: entry.to.token === SSE_TOKEN_MINT,
        signature: entry.signature,
      }))

      setTransactions((prev) => [...newTransactions, ...prev].slice(0, 100)) // Keep last 100 transactions
    }

    eventSource.onerror = (error) => {
      console.error('SSE Feed Error:', error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return {
    transactions,
  }
}
