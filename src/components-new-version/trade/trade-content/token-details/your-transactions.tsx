import { Spinner } from "@/components-new-version/ui"
import { useTransactionHistory } from "../../hooks/use-transaction-history"
import { FilterTabsYourTransactions } from "../filter-token-details"
import TransactionView from "./transaction-view"
import { useMemo, useState } from "react"
import Pagination from "./pagination"

interface YourTransactionsProps {
  id: string
  walletAddress: string
  sort: FilterTabsYourTransactions
}
const TransactionsHistoryPerPage = 1

export function YourTransactions({ id, walletAddress, sort }: YourTransactionsProps) {
  const { transactionHistory, fetchTxLoading } = useTransactionHistory(id, walletAddress)
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

    return transactionHistory.filter(tx => {
      return tx.timestamp >= now - timeThreshold && tx.timestamp <= now
    })
  }, [transactionHistory, sort])

  const pagedTransactionHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * TransactionsHistoryPerPage
    const endIndex = Math.min(startIndex + TransactionsHistoryPerPage, sortedTransactionHistory.length)
    return sortedTransactionHistory.slice(startIndex, endIndex)
  }, [sortedTransactionHistory, currentPage])

  const totalPages = useMemo(() => {
    if (sortedTransactionHistory.length === 0) return 1
    if (sortedTransactionHistory.length < TransactionsHistoryPerPage) return 1
    return Math.ceil(sortedTransactionHistory.length / TransactionsHistoryPerPage)
  }, [sortedTransactionHistory])

  return (
    <>
      <div className="h-[250px] overflow-auto">
        {
          fetchTxLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner />
            </div>
          ) : (
            <>
              {
                pagedTransactionHistory.length ? (
                  <div className="space-y-2">
                    {
                      pagedTransactionHistory.map((tx, index) => {
                        return (
                          <TransactionView
                            key={index}
                            baseTokenAmount={tx.baseTokenAmount}
                            baseTokenMint={tx.baseTokenMint}
                            quoteTokenAmount={tx.quoteTokenAmount}
                            quoteTokenMint={tx.quoteTokenMint}
                            signature={tx.signature}
                            timestamp={tx.timestamp}
                          />
                        )
                      })
                    }
                  </div>
                ) : (
                  <div className="w-full h-full flex justify-center items-center">
                    <span>No Transactions</span>
                  </div>
                )
              }
            </>
          )
        }
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  )
}