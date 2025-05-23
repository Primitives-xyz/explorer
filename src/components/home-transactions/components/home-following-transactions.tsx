'use client'

import { Animate, Skeleton } from '@/components/ui'
import { mapEmpty } from '@/utils/utils'
import { useGetHomeFollowingTransactions } from '../hooks/use-get-home-following-transactions'
import { HomeTransactionEntry } from './home-transaction-entry'

interface Props {
  username: string
}

export function HomeFollowingTransactions({ username }: Props) {
  const { transactions, loading } = useGetHomeFollowingTransactions({
    username,
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
            delay: index * 0.1,
          }}
          key={transaction.signature + index}
        >
          <HomeTransactionEntry transaction={transaction} />
        </Animate>
      ))}

      {loading &&
        mapEmpty(4, (index) => (
          <Skeleton key={index} className="w-full h-[252px]" />
        ))}

      {/* <LoadMoreObserver
        hasMore={true}
        onLoadMore={onLoadMore}
        loading={loading}
      /> */}
    </>
  )
}
