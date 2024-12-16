'use client'

import { Transaction } from '@/utils/helius'
import { formatDistanceToNow } from 'date-fns'

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
    <div className="border border-green-800 bg-black/50">
      {/* Header */}
      <div className="border-b border-green-800 p-2">
        <div className="flex justify-between items-center">
          <div className="text-green-500 text-sm font-mono">
            {'>'} transaction_log.sol
          </div>
          <div className="text-xs text-green-600 font-mono">
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
              <div className="flex flex-col gap-2">
                {/* Transaction Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-400 font-mono bg-green-900/20 px-1.5 py-0.5 rounded">
                    {formatDistanceToNow(new Date(tx.timestamp * 1000))} ago
                  </span>
                  <span className="text-green-600 font-mono bg-green-900/20 px-1.5 py-0.5 rounded">
                    {tx.type}
                  </span>
                </div>

                {/* Transaction Details */}
                <div className="text-sm text-green-300 font-mono bg-green-900/10 p-2 rounded">
                  {tx.description}
                </div>

                {/* Transfers Container */}
                <div className="space-y-1 bg-green-900/5 p-2 rounded">
                  {/* Native Transfers */}
                  {tx.nativeTransfers?.map((transfer, i) => (
                    <div
                      key={i}
                      className="text-xs text-green-500 font-mono flex items-center gap-2"
                    >
                      <span className="text-green-600">
                        {transfer.amount > 0 ? '↓' : '↑'}
                      </span>
                      <span className="bg-green-900/20 px-1.5 py-0.5 rounded">
                        {Math.abs(transfer.amount)} SOL
                      </span>
                    </div>
                  ))}

                  {/* Token Transfers */}
                  {tx.tokenTransfers?.map((transfer, i) => (
                    <div
                      key={i}
                      className="text-xs text-green-500 font-mono flex items-center gap-2"
                    >
                      <span className="text-green-600">
                        {transfer.tokenAmount > 0 ? '↓' : '↑'}
                      </span>
                      <span className="bg-green-900/20 px-1.5 py-0.5 rounded">
                        {Math.abs(transfer.tokenAmount)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Transaction Hash */}
                <div className="text-xs text-green-800 font-mono truncate hover:text-green-600">
                  sig: {tx.signature}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with View More option */}
      {transactions.length > 0 && (
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
