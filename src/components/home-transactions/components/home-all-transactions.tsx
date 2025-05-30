'use client'

import { Animate, Skeleton } from '@/components/ui'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { mapEmpty } from '@/utils/utils'
import { useGetHomeAllTransactions } from '../hooks/use-get-home-all-transactions'
import { HomeTransactionEntry } from './home-transaction-entry'

export function HomeAllTransactions() {
  const { transactions, loading, loadMore, hasMore, currentPage } =
    useGetHomeAllTransactions({
      pageSize: 20,
      infiniteScroll: true,
    })

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading,
  })

  return (
    <>
      {transactions?.map((transaction, index) => (
        <Animate
          isVisible={true}
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.3,
            delay: index * 0.05, // Reduced delay for smoother experience
          }}
          key={transaction.signature + index}
        >
          <HomeTransactionEntry transaction={transaction} />
        </Animate>
      ))}

      {/* Loading skeleton for initial load */}
      {loading &&
        currentPage === 1 &&
        mapEmpty(4, (index) => (
          <Skeleton key={index} className="w-full h-[252px]" />
        ))}

      {/* Loading indicator for subsequent pages */}
      {loading && currentPage > 1 && (
        <div className="flex justify-center py-4">
          <Skeleton className="w-full h-[252px]" />
        </div>
      )}

      {/* Invisible trigger element for infinite scroll */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-10 w-full" aria-hidden="true" />
      )}

      {/* End of list indicator */}
      {!hasMore && transactions && transactions.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No more transactions to load
        </div>
      )}
    </>
  )
}
