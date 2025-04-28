'use client'

import { useGetFollowing } from '@/components/tapestry/hooks/use-get-following'
import { useGetNamespaceProfiles } from '@/components/tapestry/hooks/use-get-namespace-profiles'
import { useFollowingTransactions } from '@/components/transactions/hooks/use-following-transactions'
import {
  Button,
  Card,
  CardContent,
  FilterTabs,
  Paragraph,
  Spinner,
} from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { FollowingTransactionsList } from './following-transactions-list'

export enum FilterType {
  ALL = 'all',
  SWAP = 'swap',
  COMPRESSED_NFT_MINT = 'compressed_nft_mint',
  KOL = 'kol',
}

export function FollowingTransactions() {
  const t = useTranslations()
  const {
    mainProfile,
    isLoggedIn,
    loading: getCurrentProfileLoading,
    setShowAuthFlow,
  } = useCurrentWallet()

  const options = [
    { label: 'Twitter KOL', value: FilterType.KOL },
    { label: 'Following', value: FilterType.SWAP },
  ]

  const { following } = useGetFollowing({
    username: mainProfile?.username,
  })

  const { data: kolData } = useGetNamespaceProfiles({
    name: 'kolscan',
  })

  const {
    aggregatedTransactions,
    isLoadingTransactions,
    selectedType,
    setSelectedType,
  } = useFollowingTransactions({
    following,
    kolData,
  })

  const loading = getCurrentProfileLoading || isLoadingTransactions

  return (
    <div className="w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      <div className="space-y-4">
        {loading && (
          <div className="w-full flex justify-center items-center h-[400px]">
            <Spinner large />
          </div>
        )}
        {(!isLoggedIn || !mainProfile) && selectedType === FilterType.SWAP ? (
          <Card>
            <CardContent className="flex flex-col space-y-10 items-center justify-center">
              <Paragraph>
                {t('following_transaction.create_a_profile_to_follow')}
              </Paragraph>
              <Button onClick={() => setShowAuthFlow(true)}>
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <FollowingTransactionsList transactions={aggregatedTransactions} />
        )}
      </div>
    </div>
  )
}
