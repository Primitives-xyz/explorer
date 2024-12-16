'use client'

import { Transaction } from '@/utils/helius'
import { formatDistanceToNow } from 'date-fns'

const LAMPORTS_PER_SOL = 1000000000

const formatLamportsToSol = (lamports: number) => {
  const sol = Math.abs(lamports) / LAMPORTS_PER_SOL
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 9,
    maximumFractionDigits: 9,
  })
}

interface TransactionSectionProps {
  transactions: Transaction[]
  isLoading?: boolean
  hasSearched?: boolean
}

export const TransactionSection = ({
  transactions,
  isLoading,
  hasSearched,
}: TransactionSectionProps) => {
  const shouldShowContent =
    isLoading ||
    transactions.length > 0 ||
    (hasSearched && transactions.length === 0)

  if (!shouldShowContent) return null

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-green-800 p-2">
        <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
          <div className="text-green-500 text-sm font-mono whitespace-nowrap">
            {'>'} transaction_log.sol
          </div>
          <div className="text-xs text-green-600 font-mono whitespace-nowrap ml-2">
            COUNT: {transactions.length}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-green-800/30">
        {isLoading ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> FETCHING TRANSACTIONS...'}
          </div>
        ) : hasSearched && transactions.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO TRANSACTIONS FOUND'}
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.signature} className="p-3 hover:bg-green-900/10">
              <div className="flex flex-col gap-1.5 overflow-hidden">
                {/* Transaction Header */}
                <div className="flex items-center justify-between text-xs overflow-x-auto scrollbar-none">
                  <span className="text-green-400 font-mono bg-green-900/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                    {formatDistanceToNow(new Date(tx.timestamp * 1000))} ago
                  </span>
                  <span className="text-green-600 font-mono bg-green-900/20 px-1.5 py-0.5 rounded whitespace-nowrap ml-2">
                    {tx.type}
                  </span>
                </div>

                {/* Transaction Details */}
                <div className="text-base text-green-300 font-mono bg-green-900/10 p-2 rounded overflow-x-auto scrollbar-none break-words">
                  {tx.description}
                </div>

                {/* Transfers Container */}
                <div className="space-y-1 bg-green-900/5 p-1.5 rounded overflow-hidden">
                  {/* Native Transfers */}
                  {tx.nativeTransfers?.map((transfer, i) => (
                    <div
                      key={i}
                      className="text-sm text-green-500 font-mono flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap"
                    >
                      <span className="text-green-600 flex-shrink-0">
                        {transfer.amount > 0 ? '↓' : '↑'}
                      </span>
                      <span className="bg-green-900/20 px-2 py-0.5 rounded flex-shrink-0 font-semibold">
                        {formatLamportsToSol(transfer.amount)} SOL
                      </span>
                    </div>
                  ))}

                  {/* Token Transfers */}
                  {tx.tokenTransfers?.map((transfer, i) => (
                    <div
                      key={i}
                      className="text-sm text-green-500 font-mono flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap"
                    >
                      <span className="text-green-600 flex-shrink-0">
                        {transfer.tokenAmount > 0 ? '↓' : '↑'}
                      </span>
                      <span className="bg-green-900/20 px-2 py-0.5 rounded flex-shrink-0 font-semibold">
                        {Math.abs(transfer.tokenAmount)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Transaction Hash */}
                <div className="text-xs text-green-800 font-mono truncate hover:text-green-600 overflow-hidden pt-0.5">
                  sig: {tx.signature}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with View More option */}
      {transactions.length > 0 && !isLoading && (
        <div className="border-t border-green-800 p-2">
          <button
            className="w-full text-center text-xs text-green-600 hover:text-green-500 font-mono"
            onClick={() => {
              /* TODO: Implement load more logic */
            }}
          >
            {'>>> LOAD MORE TRANSACTIONS <<<'}
          </button>
        </div>
      )}
    </div>
  )
}
