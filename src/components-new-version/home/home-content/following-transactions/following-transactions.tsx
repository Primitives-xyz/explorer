'use client'

import { useGetFollowing } from '@/components-new-version/tapestry/hooks/use-get-following'
import { useGetNamespaceProfiles } from '@/components-new-version/tapestry/hooks/use-get-namespace-profiles'
import { useFollowingTransactions } from '@/components-new-version/transactions/hooks/use-following-transactions'
import { TransactionsEntry } from '@/components-new-version/transactions/transactions-entry'
import { FilterTabs, Spinner } from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'

export enum FilterType {
  ALL = 'all',
  SWAP = 'swap',
  COMPRESSED_NFT_MINT = 'compressed_nft_mint',
  KOL = 'kol',
}

interface Props {
  username: string
}

export function FollowingTransactions({ username }: Props) {
  const { following } = useGetFollowing({
    username,
  })
  const { data: kolData } = useGetNamespaceProfiles({
    name: 'kolscan',
  })

  const { walletAddress } = useCurrentWallet()

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
    { label: 'Twitter KOL', value: FilterType.KOL },
  ]

  return (
    <div className="w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      {isLoadingTransactions ? (
        <div className="w-full flex justify-center items-center h-[400px]">
          <Spinner large />
        </div>
      ) : (
        <div className="space-y-4">
          {aggregatedTransactions.map((transaction, index) => (
            <TransactionsEntry
              key={index}
              transaction={transaction}
              walletAddress={walletAddress}
              displaySwap
            />
          ))}
        </div>
      )}
    </div>
  )
}
