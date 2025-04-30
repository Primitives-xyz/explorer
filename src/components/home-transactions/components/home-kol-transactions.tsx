'use client'

import { Animate, Skeleton } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { mapEmpty } from '@/utils/utils'
import { useGetHomeKolTransactions } from '../hooks/use-get-home-kol-transactions'
import { HomeTransactionEntry } from './home-transaction-entry'

export function HomeKolTransactions() {
  const { walletAddress } = useCurrentWallet()
  // const { transactions, loading, onLoadMore } = useGetHomeKolTransactions()
  const { transactions, loading } = useGetHomeKolTransactions()

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
          <HomeTransactionEntry
            transaction={transaction}
            walletAddress={walletAddress}
          />
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
