'use client'

import { FilterButton } from '@/components-new-version/home/home-content/following-transactions/filters-button'
import { useFollowingTransactions } from '@/components-new-version/home/home-content/following-transactions/hooks/use-following-transactions'
import { TransactionsEntry } from '@/components-new-version/home/home-content/following-transactions/transactions-entry'
import { useGetFollowing } from '@/components-new-version/tapestry/hooks/use-get-following'
import { Spinner } from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'

export function FollowingTransactions() {
  const { mainUsername } = useCurrentWallet()
  const { following } = useGetFollowing(mainUsername)

  const {
    aggregatedTransactions,
    isLoadingTransactions,
    totalWallets,
    selectedType,
    setSelectedType,
  } = useFollowingTransactions({ following })

  return (
    <>
      <FilterButton
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {isLoadingTransactions && (
        <div className="w-full flex justify-center items-center pt-24">
          <Spinner large />
        </div>
      )}
      {aggregatedTransactions.map((transaction, index) => (
        <TransactionsEntry key={index} transaction={transaction} />
      ))}
    </>
  )
}
