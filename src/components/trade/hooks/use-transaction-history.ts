import { TransactionHistory } from '@/components/tapestry/models/helius.models'
import { useEffect, useState } from 'react'

export function useTransactionHistory(id: string, walletAddress: string) {
  const [transactionHistory, setTransactionHistory] = useState<
    TransactionHistory[]
  >([])
  const [fetchTransactionLoading, setFetchTransactionLoading] =
    useState<boolean>(false)
  const [page, setPage] = useState<number>(1)

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!walletAddress) return

      setFetchTransactionLoading(true)

      try {
        const url = new URL(`/api/transactions/swap`, window.location.origin)
        url.searchParams.set('mint', id)
        url.searchParams.set('address', walletAddress)

        if (page > 1 && transactionHistory.length > 0) {
          const lastTransaction =
            transactionHistory[transactionHistory.length - 1]
          if (lastTransaction.signature) {
            url.searchParams.set('before', lastTransaction.signature)
          }
        }

        url.searchParams.set('type', 'SWAP')

        const response = await fetch(url)
        const data = await response.json()

        if (data.error) {
          console.error(data.error)
          return
        }

        const history = data.history
        console.log('history:', history)

        if (history.length === 0) {
          if (page > 1) {
            setPage((prepage) => prepage - 1)
          }

          setFetchTransactionLoading(false)
          return
        }

        setTransactionHistory(history)
        // setTransactionHistory([])
      } catch (error) {
        console.error('Error in fetch transaction history:', error)
      } finally {
        setFetchTransactionLoading(false)
      }
    }

    fetchTransaction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, id, page])

  return {
    page,
    setPage,
    fetchTransactionLoading,
    transactionHistory,
  }
}
