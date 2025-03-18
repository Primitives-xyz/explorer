'use client'

import { FilterButton } from '@/components-new-version/home/home-content/following-transactions/filters-button'
import { useFollowingTransactions } from '@/components-new-version/home/home-content/following-transactions/hooks/use-following-transactions'
import { TransactionsEntry } from '@/components-new-version/home/home-content/following-transactions/transactions-entry'
import { useGetFollowing } from '@/components-new-version/tapestry/hooks/use-get-following'
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
      {aggregatedTransactions.map((transaction, index) => (
        <TransactionsEntry key={index} transaction={transaction} />
      ))}
    </>
  )
}
