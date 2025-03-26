import { IProfile } from '@/types/profile.types'
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { FollowingTransactionFeed } from './following-transaction-feed'
import { useFollowingTransactions } from './hooks/use-following-transactions'
import { useGetFollowing } from './hooks/use-get-following'

interface ActivityFeedContainerProps {
  username: string
}

export const ActivityFeedContainer = ({
  username,
}: ActivityFeedContainerProps) => {
  const isLoggedIn = useIsLoggedIn()

  // following data
  const { following, loading } = useGetFollowing(username)

  const {
    aggregatedTransactions,
    isLoadingTransactions,
    loadedWallets,
    totalWallets,
    selectedType,
    setSelectedType,
  } = useFollowingTransactions(following)

  // console.log('following ------------')
  // console.log(JSON.stringify(following, null, 2))

  // kolscan data
  // const { data: kolscanData, isLoading: kolscanLoading } =
  //   useGetNamespaceProfiles({
  //     name: 'kolscan',
  //   })

  // const kolscanTransactionsInput = {
  //   page: kolscanData?.page || 1,
  //   pageSize: kolscanData?.pageSize || 10,
  //   profiles: kolscanData
  //     ? (kolscanData.profiles
  //         .flatMap((p) => ({
  //           ...p.profile,
  //           wallet: {
  //             id: p.wallet.address,
  //           },
  //         }))
  //         .slice(0, 1) as IProfile[])
  //     : [], // Always provide at least an empty array
  // }

  // console.log('kolscanData ------------')
  // console.log(JSON.stringify(kolscanTransactionsInput, null, 2))

  const {
    aggregatedTransactions: kolscanAggregatedTransactions,
    isLoadingTransactions: kolscanIsLoadingTransactions,
    loadedWallets: kolscanLoadedWallets,
    totalWallets: kolscanTotalWallets,
    selectedType: kolscanSelectedType,
    setSelectedType: kolscanSetSelectedType,
  } = useFollowingTransactions({
    page: 1,
    pageSize: 10,
    profiles: [
      {
        image:
          'https://cdn.kolscan.io/profiles/3h65MmPZksoKKyEpEjnWU2Yk2iYT5oZDNitGy5cTaxoE.png',
        namespace: 'kolscan',
        created_at: 1741273608482,
        id: 'Jidn',
        username: 'Jidn',
        wallet: {
          id: '3h65MmPZksoKKyEpEjnWU2Yk2iYT5oZDNitGy5cTaxoE',
        },
      },
    ] as IProfile[],
  })

  return (
    <div className="space-y-4">
      <FollowingTransactionFeed
        transactions={aggregatedTransactions}
        isLoading={isLoadingTransactions || loading}
        isLoggedIn={isLoggedIn}
        loadedWallets={loadedWallets}
        totalWallets={totalWallets}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
      <FollowingTransactionFeed
        title="KOLScan"
        transactions={kolscanAggregatedTransactions}
        isLoading={kolscanIsLoadingTransactions}
        // isLoading={kolscanIsLoadingTransactions || kolscanLoading}
        isLoggedIn={isLoggedIn}
        loadedWallets={kolscanLoadedWallets}
        totalWallets={kolscanTotalWallets}
        selectedType={kolscanSelectedType}
        setSelectedType={kolscanSetSelectedType}
      />
    </div>
  )
}
