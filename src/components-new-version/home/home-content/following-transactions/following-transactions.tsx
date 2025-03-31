'use client'

import { FilterTabs } from '@/components-new-version/common/filter-tabs'
import { useFollowingTransactions } from '@/components-new-version/home/home-content/following-transactions/hooks/use-following-transactions'
import { TransactionsEntry } from '@/components-new-version/home/home-content/following-transactions/transactions-entry'
import { useGetFollowing } from '@/components-new-version/tapestry/hooks/use-get-following'
import { useGetNamespaceProfiles } from '@/components-new-version/tapestry/hooks/use-get-namespace-profiles'
import { Button, Card, CardContent, Spinner } from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useTranslations } from 'next-intl'

export enum FilterType {
  ALL = 'all',
  SWAP = 'swap',
  COMPRESSED_NFT_MINT = 'compressed_nft_mint',
  KOL = 'kol',
}

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

  const options = [
    { label: 'All', value: FilterType.ALL },
    { label: 'Swap', value: FilterType.SWAP },
    { label: 'CNFT Mints', value: FilterType.COMPRESSED_NFT_MINT },
    { label: 'Twitter KOL', value: FilterType.KOL },
  ]

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
    <div className="w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />

      {isLoadingTransactions && (
        <div className="w-full flex justify-center items-center pt-24">
          <Spinner large />
        </div>
      )}

      <div className="space-y-4">
        {aggregatedTransactions.map((transaction, index) => (
          <TransactionsEntry key={index} transaction={transaction} />
        ))}
      </div>
    </div>
  )
}
