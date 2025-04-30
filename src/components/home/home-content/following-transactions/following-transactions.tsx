'use client'

import { useEffect, useState } from 'react'
import { useGetFollowing } from '@/components/tapestry/hooks/use-get-following'
import { useGetNamespaceProfiles } from '@/components/tapestry/hooks/use-get-namespace-profiles'
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
  const { data: kolData } = useGetNamespaceProfiles({ name: 'kolscan' })
  const t = useTranslations()
  const {
    mainProfile,
    isLoggedIn,
    loading: getCurrentProfileLoading,
    walletAddress,
    setShowAuthFlow,
  } = useCurrentWallet()
  const options = [
    { label: 'Twitter KOL', value: FilterType.KOL },
    { label: 'Following', value: FilterType.SWAP },
  ]
  const { following } = useGetFollowing({ username: mainProfile?.username })
  const [kolTransactions, setKolTransactions] = useState<any[]>([])
  const [followingTransactions, setFollowingTransactions] = useState<any[]>([])
  const [loadingKOL, setLoadingKOL] = useState(false)
  const [loadingFollowing, setLoadingFollowing] = useState(false)
  const [selectedType, setSelectedType] = useState(FilterType.KOL)

  // Prefetch KOL transactions as soon as kolData is available
  useEffect(() => {
    if (!kolData?.profiles) return
    setLoadingKOL(true)
    const wallets = kolData.profiles.map((entry: any) => entry.wallet?.address).filter(Boolean)
    let allTxs: any[] = []
    let loaded = 0
    if (wallets.length === 0) {
      setKolTransactions([])
      setLoadingKOL(false)
      return
    }
    wallets.forEach(walletId => {
      fetch(`/api/transactions?address=${walletId}&limit=7`)
        .then(res => res.json())
        .then(newTxs => {
          allTxs = [...allTxs, ...newTxs]
        })
        .finally(() => {
          loaded++
          if (loaded === wallets.length) {
            setKolTransactions(allTxs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
            setLoadingKOL(false)
          }
        })
    })
  }, [kolData])

  // Fetch Following transactions as soon as following is available
  useEffect(() => {
    if (!following?.profiles) return
    setLoadingFollowing(true)
    const wallets = following.profiles.map((p: any) => p.wallet?.id).filter(Boolean)
    let allTxs: any[] = []
    let loaded = 0
    if (wallets.length === 0) {
      setFollowingTransactions([])
      setLoadingFollowing(false)
      return
    }
    wallets.forEach(walletId => {
      fetch(`/api/transactions?address=${walletId}&limit=7`)
        .then(res => res.json())
        .then(newTxs => {
          allTxs = [...allTxs, ...newTxs]
        })
        .finally(() => {
          loaded++
          if (loaded === wallets.length) {
            setFollowingTransactions(allTxs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
            setLoadingFollowing(false)
          }
        })
    })
  }, [following])

  // Loading states for each tab
  const kolTabLoading = loadingKOL
  const followingTabLoading = getCurrentProfileLoading || loadingFollowing

  return (
    <div className="w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      <div className="space-y-4">
        {selectedType === FilterType.KOL && kolTabLoading && (
          <div className="w-full flex justify-center items-center h-[400px]">
            <Spinner large />
          </div>
        )}
        {selectedType === FilterType.SWAP && followingTabLoading && (
          <div className="w-full flex justify-center items-center h-[400px]">
            <Spinner large />
          </div>
        )}
        {selectedType === FilterType.KOL &&
          kolTransactions.map((transaction, index) => (
            <TransactionsEntry
              key={transaction.signature ? transaction.signature + index : index}
              transaction={transaction}
              walletAddress={walletAddress}
              displaySwap
            />
          ))}
        {selectedType === FilterType.SWAP &&
          ((!isLoggedIn || !mainProfile) ? (
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
            followingTransactions.map((transaction, index) => (
              <TransactionsEntry
                key={transaction.signature ? transaction.signature + index : index}
                transaction={transaction}
                walletAddress={walletAddress}
                displaySwap
              />
            ))
          ))}
      </div>
    </div>
  )
}
