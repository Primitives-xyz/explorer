'use client'

import { useGetFollowing } from '@/components/tapestry/hooks/use-get-following'
import { useGetNamespaceProfiles } from '@/components/tapestry/hooks/use-get-namespace-profiles'
import { useFollowingTransactions } from '@/components/transactions/hooks/use-following-transactions'
import { TransactionsEntry } from '@/components/transactions/transactions-entry'
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

export enum FilterType {
  ALL = 'all',
  SWAP = 'swap',
  COMPRESSED_NFT_MINT = 'compressed_nft_mint',
  KOL = 'kol',
}

export function FollowingTransactions() {
  const t = useTranslations()
  const { mainProfile, isLoggedIn, loading, walletAddress, setShowAuthFlow } =
    useCurrentWallet()

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
  } = useFollowingTransactions({ following, kolData })

  return (
    <div className="w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      <div className="space-y-4">
        {isLoadingTransactions || loading ? (
          <div className="w-full flex justify-center items-center h-[400px]">
            <Spinner large />
          </div>
        ) : (!isLoggedIn || !mainProfile) &&
          selectedType === FilterType.SWAP ? (
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
          <>
            {aggregatedTransactions.map((transaction, index) => (
              <TransactionsEntry
                key={index}
                transaction={transaction}
                walletAddress={walletAddress}
                displaySwap
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
