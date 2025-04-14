import { Button, ButtonVariant, Spinner } from '@/components/ui'
import { useMemo, useState } from 'react'
import { useTransactionHistory } from '../../hooks/use-transaction-history'
import { FilterTabsYourTransactions } from '../filter-token-details'
import Pagination from './pagination'
import TransactionView from './transaction-view'

interface YourTransactionsProps {
  id: string
  walletAddress: string
  sort: FilterTabsYourTransactions
  setShowAuthFlow: (show: boolean) => void
}
const TransactionsHistoryPerPage = 20

export function YourTransactions({
  id,
  walletAddress,
  sort,
  setShowAuthFlow,
}: YourTransactionsProps) {
  const { transactionHistory, fetchTransactionLoading } = useTransactionHistory(
    id,
    walletAddress
  )
  const [currentPage, setCurrentPage] = useState(1)

  const sortedTransactionHistory = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)
    let timeThreshold
    switch (sort) {
      case FilterTabsYourTransactions.DAY:
        timeThreshold = 24 * 60 * 60
        break
      case FilterTabsYourTransactions.WEEK:
        timeThreshold = 7 * 24 * 60 * 60
        break
      case FilterTabsYourTransactions.MONTH:
        timeThreshold = 30 * 24 * 60 * 60
        break
      default:
        timeThreshold = now
        break
    }

    return transactionHistory.filter((tx) => {
      return tx.timestamp >= now - timeThreshold && tx.timestamp <= now
    })
  }, [transactionHistory, sort])

  const pagedTransactionHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * TransactionsHistoryPerPage
    const endIndex = Math.min(
      startIndex + TransactionsHistoryPerPage,
      sortedTransactionHistory.length
    )
    return sortedTransactionHistory.slice(startIndex, endIndex)
  }, [sortedTransactionHistory, currentPage])

  const totalPages = useMemo(() => {
    if (sortedTransactionHistory.length === 0) return 1
    if (sortedTransactionHistory.length < TransactionsHistoryPerPage) return 1
    return Math.ceil(
      sortedTransactionHistory.length / TransactionsHistoryPerPage
    )
  }, [sortedTransactionHistory])

  if (!pagedTransactionHistory?.length) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span>No Transactions</span>
      </div>
    )
  }

  return (
    <>
      <div className="h-[250px] overflow-auto">
        {walletAddress ? (
          <>
            {fetchTransactionLoading ? (
              <div className="w-full h-full flex justify-center items-center">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-2">
                {pagedTransactionHistory.map((transaction, index) => (
                  <TransactionView
                    key={index}
                    baseTokenAmount={transaction.baseTokenAmount}
                    baseTokenMint={transaction.baseTokenMint}
                    quoteTokenAmount={transaction.quoteTokenAmount}
                    quoteTokenMint={transaction.quoteTokenMint}
                    signature={transaction.signature}
                    timestamp={transaction.timestamp}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center space-y-4">
            <span>Login or sign up to see your transaction history</span>
            <div className="w-[200px]">
              <Button
                variant={ButtonVariant.OUTLINE}
                expand
                onClick={() => setShowAuthFlow(true)}
              >
                Connect wallet
              </Button>
            </div>
          </div>
        )}
      </div>
      {pagedTransactionHistory.length && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  )
}
