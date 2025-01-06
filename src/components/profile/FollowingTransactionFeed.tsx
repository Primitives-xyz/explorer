import { Transaction } from '@/utils/helius/types'
import { useState, useEffect } from 'react'
import { useHolderCheck } from '@/components/auth/hooks/use-holder-check'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { TransactionCard } from '@/components/transactions/TransactionCard'
import { isSpamTransaction } from '@/utils/transaction'

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
  const { isHolder, showModal, closeModal, isCheckingHolder, startCheck } =
    useHolderCheck()
  const [expandedTx, setExpandedTx] = useState<string | null>(null)
  const {
    walletAddress,
    isLoggedIn: currentIsLoggedIn,
    sdkHasLoaded: currentSdkHasLoaded,
  } = useCurrentWallet()

  // Trigger initial check when component mounts
  useEffect(() => {
    if (walletAddress && isLoggedIn && sdkHasLoaded && isHolder === null) {
      console.log('TransactionFeed: Triggering initial holder check')
      startCheck()
    }
  }, [walletAddress, isLoggedIn, sdkHasLoaded, isHolder])

  // Show loading state while checking holder status
  if (isCheckingHolder) {
    return (
      <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col relative group h-[484px]">
        <div className="border-b border-green-800 p-2">
          <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
            <div className="text-green-500 text-sm font-mono">
              {'>'} following_activity.sol
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="text-green-400 font-mono text-lg mb-4">
            🐸 Checking holder status...
          </div>
        </div>
      </div>
    )
  }

  // If we need to show the holder modal, render that instead
  if (!isHolder) {
    return (
      <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col relative group h-[484px]">
        <div className="border-b border-green-800 p-2">
          <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
            <div className="text-green-500 text-sm font-mono">
              {'>'} following_activity.sol
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="text-green-400 font-mono text-lg mb-4">
            🐸 Frog Holder Access Required
          </div>
          <div className="text-green-500 font-mono text-sm max-w-md mb-6">
            To view transaction activity, you need to be a holder of a Frog NFT.
          </div>
          {showModal && (
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-green-900/20 border border-green-800 text-green-400 hover:bg-green-900/30 transition-colors rounded font-mono text-sm"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    )
  }

  // Only process transactions if they are a holder
  const filteredTransactions = transactions.filter(
    (tx) => !isSpamTransaction(tx),
  )

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col relative group h-[484px]">
      <div className="border-b border-green-800 p-2">
        <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
          <div className="text-green-500 text-sm font-mono">
            {'>'} following_activity.sol
          </div>
          <div className="text-xs text-green-600 font-mono whitespace-nowrap ml-2">
            COUNT: {filteredTransactions.length}
            {isLoading && totalWallets > 0 && (
              <span className="ml-2">
                ({loadedWallets}/{totalWallets} wallets)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicators */}
      <div
        className="absolute right-1 top-[40px] bottom-1 w-1 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: 0,
          animation: 'fadeOut 0.3s ease-out',
        }}
      >
        <div className="h-full bg-green-500/5 rounded-full">
          <div
            className="h-16 w-full bg-green-500/10 rounded-full"
            style={{
              animation: 'slideY 3s ease-in-out infinite',
              transformOrigin: 'top',
            }}
          />
        </div>
      </div>

      <div
        className="divide-y divide-green-800/30 overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50 hover-scroll-indicator"
        onScroll={(e) => {
          const indicator = e.currentTarget.previousSibling as HTMLElement
          if (e.currentTarget.scrollTop > 0) {
            indicator.style.opacity = '1'
            indicator.style.animation = 'fadeIn 0.3s ease-out'
          } else {
            indicator.style.opacity = '0'
            indicator.style.animation = 'fadeOut 0.3s ease-out'
          }
        }}
      >
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
        ) : filteredTransactions.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO RECENT ACTIVITY'}
          </div>
        ) : (
          <>
            {filteredTransactions.map((tx) => (
              <TransactionCard
                key={tx.signature}
                transaction={tx}
                sourceWallet={tx.sourceWallet || walletAddress || ''}
                isExpanded={expandedTx === tx.signature}
                onExpand={() =>
                  setExpandedTx(
                    expandedTx === tx.signature ? null : tx.signature,
                  )
                }
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
    </div>
  )
}
