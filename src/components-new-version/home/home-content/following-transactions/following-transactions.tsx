'use client'

import { FilterButton } from '@/components-new-version/home/home-content/following-transactions/filters-button'
import { useFollowingTransactions } from '@/components-new-version/home/home-content/following-transactions/hooks/use-following-transactions'
import { TransactionsEntry } from '@/components-new-version/home/home-content/following-transactions/transactions-entry'
import { useGetFollowing } from '@/components-new-version/tapestry/hooks/use-get-following'
import { Button, Card, CardContent, Spinner } from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useGetNamespaceProfiles } from '@/hooks/use-get-namespace-profiles'
import { useTranslations } from 'next-intl'

export function FollowingTransactions() {
  const { mainUsername, isLoggedIn, setShowAuthFlow } = useCurrentWallet()
  const { following } = useGetFollowing({ username: mainUsername })
  const { data: kolData } = useGetNamespaceProfiles({
    name: 'kolscan',
  })

  const t = useTranslations()

  const {
    aggregatedTransactions,
    isLoadingTransactions,
    totalWallets,
    selectedType,
    setSelectedType,
  } = useFollowingTransactions({ following, kolData })

  if (!isLoggedIn) {
    return (
      <Card>
        <CardContent className="flex flex-col space-y-10 items-center justify-center">
          <p>{t('following_transaction.create_a_profile_to_follow')}</p>
          <Button onClick={() => setShowAuthFlow(true)}>connect wallet</Button>
        </CardContent>
      </Card>
    )
  }

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
