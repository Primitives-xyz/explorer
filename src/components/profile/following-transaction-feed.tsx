import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { DataContainer } from '@/components/common/DataContainer'
import { FilterBar } from '@/components/common/FilterBar'
import { FilterButton } from '@/components/common/FilterButton'
import { ScrollableContent } from '@/components/common/scrollable-content'
import { TransactionCard } from '@/components/transactions/transaction-card'
import type { Transaction } from '@/utils/helius/types'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

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
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

// Mock transactions for the blurred preview
const MOCK_TRANSACTIONS: Partial<Transaction>[] = [
  {
    type: 'SWAP',
    source: 'JUPITER',
    description: 'Swapped 10 SOL for 138.42 USDC on Jupiter',
    timestamp: Date.now() / 1000,
    signature: '3xR5Zqx9vK7u8k4Y',
    sourceWallet: 'trader.sol',
    fee: 5000,
  },
  {
    type: 'SWAP',
    source: 'ORCA',
    description: 'Swapped 500 USDC for 2.85 SOL on Orca',
    timestamp: Date.now() / 1000 - 300,
    signature: '7pL2Mqn8dR4w9j6X',
    sourceWallet: 'whale.sol',
    fee: 5000,
  },
  {
    type: 'SWAP',
    source: 'RAYDIUM',
    description: 'Swapped 1000 RAY for 45 SOL on Raydium',
    timestamp: Date.now() / 1000 - 600,
    signature: '2kN9Xqp5vM3r7h4W',
    sourceWallet: 'dex.sol',
    fee: 5000,
  },
]

interface FollowingTransactionFeedProps {
  transactions: Transaction[]
  isLoading: boolean
  isLoggedIn: boolean
  loadedWallets?: number
  totalWallets?: number
  selectedType: string
  setSelectedType: (type: string) => void
}

export const FollowingTransactionFeed = ({
  transactions,
  isLoading,
  isLoggedIn,
  loadedWallets = 0,
  totalWallets = 0,
  selectedType,
  setSelectedType,
}: FollowingTransactionFeedProps) => {
  const { walletAddress } = useCurrentWallet()

  const t = useTranslations()

  // Get unique transaction types from the results
  const transactionTypes = useMemo(() => {
    return [
      { value: 'all', label: t('following-transaction.all') },
      { value: 'swap', label: t('following-transaction.swap') },
      { value: 'transfer', label: t('following-transaction.transfer') },
      {
        value: 'compressed_nft_mint',
        label: t('following-transaction.compressed_nft_mint'),
      },
    ]
  }, [])

  // Helper to format the loading/empty text
  const getDisplayText = (type: string) => {
    switch (type) {
      case 'all':
        return 'TRANSACTIONS'
      case 'swap':
        return 'SWAP TRANSACTIONS'
      case 'transfer':
        return 'TRANSFERS'
      case 'compressed_nft_mint':
        return 'CNFT MINTS'
      default:
        return 'TRANSACTIONS'
    }
  }

  // If not logged in, show the preview with CTA
  if (!isLoggedIn) {
    return (
      <DataContainer title="following_activity" height="large">
        <div className="relative">
          {/* Create Profile CTA */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <h3 className=" font-mono text-lg mb-4">
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

  const headerRight = isLoading && totalWallets > 0 && (
    <div className="text-xs  font-mono">
      ({loadedWallets}/{totalWallets} wallets)
    </div>
  )

  return (
    <DataContainer
      title="following_activity"
      count={transactions.length}
      height="large"
      headerRight={headerRight}
      className="sm:min-w-[500px] min-w-full"
    >
      <FilterBar className="flex-wrap gap-2">
        {transactionTypes.map((type) => (
          <FilterButton
            key={type.value}
            label={type.label}
            isSelected={selectedType === type.value}
            onClick={() => setSelectedType(type.value)}
            className="text-sm"
          />
        ))}
      </FilterBar>

      <ScrollableContent
        isLoading={isLoading}
        isEmpty={!isLoading && transactions.length === 0}
        loadingText={`>>> LOADING ${getDisplayText(selectedType)}...`}
        emptyText={`>>> NO ${getDisplayText(selectedType)} FOUND`}
      >
        <div className="divide-y divide-green-800/30">
          {isLoading ? (
            // Show loading skeletons
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
              {transactions.map((tx, index) => (
                <TransactionCard
                  key={`${tx.signature}-${index}`}
                  transaction={tx}
                  sourceWallet={tx.sourceWallet || walletAddress || ''}
                />
              ))}
            </>
          )}
        </div>
      </ScrollableContent>
    </DataContainer>
  )
}
