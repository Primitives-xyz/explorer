import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { DataContainer } from '@/components/common/data-container'
import { FilterBar } from '@/components/common/filter-bar'
import { FilterButton } from '@/components/common/filter-button'
import { ScrollableContent } from '@/components/common/scrollable-content'
import { TransactionCard } from '@/components/transactions/transaction-card'
import type { Transaction } from '@/utils/helius/types'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

// Extend the existing interfaces to include className
declare module '@/components/common/filter-bar' {
  export interface FilterBarProps {
    children: React.ReactNode
    className?: string
  }
}

declare module '@/components/common/filter-button' {
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
  title?: string
  selectedType: string
  setSelectedType: (type: string) => void
}

export const FollowingTransactionFeed = ({
  transactions,
  isLoading,
  isLoggedIn,
  loadedWallets = 0,
  totalWallets = 0,
  title,
  selectedType,
  setSelectedType,
}: FollowingTransactionFeedProps) => {
  const { walletAddress } = useCurrentWallet()
  const t = useTranslations()

  // Get unique transaction types from the results
  const transactionTypes = useMemo(() => {
    return [
      { value: 'all', label: t('following_transaction.all') },
      { value: 'swap', label: t('following_transaction.swap') },
      { value: 'transfer', label: t('following_transaction.transfer') },
      {
        value: 'compressed_nft_mint',
        label: t('following_transaction.compressed_nft_mint'),
      },
    ]
  }, [t])

  // Helper to format the loading/empty text
  const getDisplayText = (type: string) => {
    switch (type) {
      case 'all':
        return t('following_transaction.transactions').toUpperCase()
      case 'swap':
        return t('following_transaction.swap_transactions').toUpperCase()
      case 'transfer':
        return t('following_transaction.transfers').toUpperCase()
      case 'compressed_nft_mint':
        return t('following_transaction.cnft_mints').toUpperCase()
      default:
        return t('following_transaction.transactions').toUpperCase()
    }
  }

  // If not logged in, show the preview with CTA
  if (!isLoggedIn) {
    return (
      <DataContainer title={t('following_activity.title')} height="large">
        <div className="relative h-full flex flex-col">
          {/* Blurred mock transactions in background */}
          <div className="absolute inset-0 divide-y divide-green-800/30 blur-sm">
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <TransactionCard
                key={i}
                transaction={tx as Transaction}
                sourceWallet={''}
              />
            ))}
          </div>

          {/* Create Profile CTA */}
          <div className="relative flex-1 flex flex-col items-center justify-center bg-background-80/95 backdrop-blur-sm px-4 py-8 sm:p-4 text-center z-10">
            <h3 className="font-mono text-base sm:text-lg mb-6 sm:mb-4 max-w-[280px] sm:max-w-none">
              {t('following_transaction.create_a_profile_to_follow')}
            </h3>
            <DynamicConnectButton>
              <div className="px-4 sm:px-6 py-3 sm:py-2 bg-green-500 hover:bg-green-400 text-black font-mono rounded transition-colors cursor-pointer text-sm sm:text-base">
                {t('following_transaction.create_profile')}
              </div>
            </DynamicConnectButton>
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
      title={title || t('following_activity.title')}
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
        loadingText={`${t('common.loading')} ${getDisplayText(selectedType)}...`}
        emptyText={`${t('common.no')} ${getDisplayText(selectedType)} ${t('common.found')}`}
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
