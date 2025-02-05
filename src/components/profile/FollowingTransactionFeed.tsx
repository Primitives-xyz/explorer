import type { Transaction } from '@/utils/helius/types'
import { useState, useMemo } from 'react'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { TransactionCard } from '@/components/transactions/TransactionCard'
import { isSpamTransaction } from '@/utils/transaction'
import { DataContainer } from '@/components/common/DataContainer'
import { ScrollableContent } from '@/components/common/ScrollableContent'
import { FilterBar } from '@/components/common/FilterBar'
import { FilterButton } from '@/components/common/FilterButton'
import dynamic from 'next/dynamic'

// Extend the existing interfaces to include className
declare module '@/components/common/FilterBar' {
  export interface FilterBarProps {
    children: React.ReactNode
    className?: string
  }
}

declare module '@/components/common/FilterButton' {
  export interface FilterButtonProps {
    label: string
    isSelected: boolean
    onClick: () => void
    className?: string
  }
}

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton,
    ),
  { ssr: false },
)

// Mock transactions for the blurred preview
const MOCK_TRANSACTIONS: Partial<Transaction>[] = [
  {
    type: 'SWAP',
    source: 'JUPITER',
    description: 'Whale.sol swapped 1000 SOL for 13,240 USDC on Jupiter',
    timestamp: Date.now() / 1000,
    signature: '3xR5Zqx9vK7u8k4Y',
    sourceWallet: 'Whale.sol',
    fee: 5000,
    feePayer: 'Whale.sol',
    slot: 123456789,
    nativeTransfers: [],
    tokenTransfers: [],
    accountData: [],
    balanceChanges: {},
  },
  {
    type: 'NFT_SALE',
    source: 'MAGIC_EDEN',
    description: 'Mad Lads #1337 sold for 45 SOL',
    timestamp: Date.now() / 1000 - 300,
    signature: '7pL2Mqn8dR4w9j6X',
    sourceWallet: 'MadLads.sol',
    fee: 5000,
    feePayer: 'MadLads.sol',
    slot: 123456790,
    nativeTransfers: [],
    tokenTransfers: [],
    accountData: [],
    balanceChanges: {},
  },
  {
    type: 'TRANSFER',
    source: 'SYSTEM_PROGRAM',
    description: 'DeGods.sol transferred 50,000 USDC to BeansDAO.sol',
    timestamp: Date.now() / 1000 - 600,
    signature: '2kN9Xqp5vM3r7h4W',
    sourceWallet: 'DeGods.sol',
    fee: 5000,
    feePayer: 'DeGods.sol',
    slot: 123456791,
    nativeTransfers: [],
    tokenTransfers: [],
    accountData: [],
    balanceChanges: {},
  },
]

type TransactionType = string

interface FollowingTransactionFeedProps {
  transactions: Transaction[]
  isLoading: boolean
  isLoggedIn: boolean
  sdkHasLoaded: boolean
  loadedWallets?: number
  totalWallets?: number
}

export const FollowingTransactionFeed = ({
  transactions,
  isLoading,
  isLoggedIn,
  sdkHasLoaded,
  loadedWallets = 0,
  totalWallets = 0,
}: FollowingTransactionFeedProps) => {
  const [selectedType, setSelectedType] = useState<TransactionType>('all')
  console.log({ sdkHasLoaded })
  const { walletAddress } = useCurrentWallet()

  // Get unique transaction types from the results
  const transactionTypes = useMemo(() => {
    const types = new Set(['all'])
    transactions.forEach((tx) => {
      if (!isSpamTransaction(tx) && tx.type) {
        types.add(tx.type.toLowerCase().replace('_', ' '))
      }
    })
    return Array.from(types)
  }, [transactions])

  // If not logged in, show the preview with CTA
  if (!isLoggedIn) {
    return (
      <DataContainer title="following_activity" height="large">
        <div className="relative">
          {/* Create Profile CTA */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <h3 className="text-green-400 font-mono text-lg mb-4">
              Create a profile to follow wallets onchain and see their swaps in
              real time!
            </h3>
            <DynamicConnectButton>
              <div className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-mono rounded transition-colors cursor-pointer">
                Create Profile
              </div>
            </DynamicConnectButton>
          </div>

          {/* Blurred mock transactions */}
          <div className="divide-y divide-green-800/30 blur-sm">
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <TransactionCard
                key={i}
                transaction={tx as Transaction}
                sourceWallet={''}
              />
            ))}
          </div>
        </div>
      </DataContainer>
    )
  }

  // Filter transactions by type and spam
  const filteredTransactions = transactions.filter((tx) => {
    if (isSpamTransaction(tx)) return false
    if (selectedType === 'all') return true
    return tx.type?.toLowerCase().replace('_', ' ') === selectedType
  })

  const headerRight = isLoading && totalWallets > 0 && (
    <div className="text-xs text-green-600 font-mono">
      ({loadedWallets}/{totalWallets} wallets)
    </div>
  )

  return (
    <DataContainer
      title="following_activity"
      count={filteredTransactions.length}
      height="large"
      headerRight={headerRight}
      className="sm:min-w-[500px] min-w-full"
    >
      <FilterBar className="flex-wrap gap-2">
        {transactionTypes.map((type) => (
          <FilterButton
            key={type}
            label={type === 'all' ? 'All' : type}
            isSelected={selectedType === type}
            onClick={() => setSelectedType(type)}
            className="text-sm"
          />
        ))}
      </FilterBar>

      <ScrollableContent
        isLoading={isLoading && filteredTransactions.length === 0}
        isEmpty={filteredTransactions.length === 0}
        loadingText=">>> LOADING TRANSACTIONS..."
        emptyText=">>> NO RECENT ACTIVITY"
      >
        <div className="divide-y divide-green-800/30">
          {isLoading && filteredTransactions.length === 0 ? (
            // Show loading skeletons when no transactions are loaded yet
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-2 animate-pulse">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-green-900/20 rounded w-2/3" />
                  <div className="h-3 bg-green-900/20 rounded w-1/2" />
                  <div className="h-3 bg-green-900/20 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : (
            <>
              {filteredTransactions.map((tx, index) => (
                <TransactionCard
                  key={`${tx.signature}-${index}`}
                  transaction={tx}
                  sourceWallet={tx.sourceWallet || walletAddress || ''}
                />
              ))}
              {isLoading && (
                <div className="p-4 text-center text-green-600 font-mono">
                  {'>>> LOADING MORE TRANSACTIONS...'}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollableContent>
    </DataContainer>
  )
}
