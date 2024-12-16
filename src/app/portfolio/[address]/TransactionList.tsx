'use client'

import { Transaction } from '@/utils/helius'
import { memo } from 'react'

interface TransactionListProps {
  transactions: Transaction[]
  loadingMore: boolean
  onLoadMore: () => void
}

function TransactionList({
  transactions,
  loadingMore,
  onLoadMore,
}: TransactionListProps) {
  const formatAmount = (amount: number) => {
    return (amount / 1e9).toFixed(4)
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:block bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Type
                </th>
                <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Description
                </th>
                <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Amount (SOL)
                </th>
                <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Date
                </th>
                <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Signature
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr
                  key={tx.signature}
                  className="hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'NFT_LISTING'
                          ? 'bg-blue-100 text-blue-800'
                          : tx.type === 'NFT_SALE'
                            ? 'bg-green-100 text-green-800'
                            : tx.type === 'NFT_CANCEL_LISTING'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tx.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span className="truncate max-w-xs">
                        {tx.description}
                      </span>
                      {tx.source && (
                        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded">
                          {tx.source}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {tx.nativeTransfers.length > 0 ? (
                      <span
                        className={`font-medium ${
                          tx.nativeTransfers[0].amount > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatAmount(tx.nativeTransfers[0].amount)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>
                        {new Date(tx.timestamp * 1000).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-900 hover:underline"
                      >
                        {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                      </a>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(tx.signature)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                        title="Copy signature"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.signature}
            className="bg-white rounded-lg shadow-md p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tx.type === 'NFT_LISTING'
                    ? 'bg-blue-100 text-blue-800'
                    : tx.type === 'NFT_SALE'
                      ? 'bg-green-100 text-green-800'
                      : tx.type === 'NFT_CANCEL_LISTING'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {tx.type.replace(/_/g, ' ')}
              </span>
              {tx.source && (
                <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded">
                  {tx.source}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600">{tx.description}</p>

            <div className="flex justify-between items-center text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">
                  {new Date(tx.timestamp * 1000).toLocaleDateString()}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>
              {tx.nativeTransfers.length > 0 && (
                <span
                  className={`font-medium ${
                    tx.nativeTransfers[0].amount > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatAmount(tx.nativeTransfers[0].amount)} SOL
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <a
                href={`https://solscan.io/tx/${tx.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-900 hover:underline"
              >
                View on Solscan
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(tx.signature)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Copy signature"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {transactions.length > 0 && (
        <div className="mt-6 px-6 py-4 bg-white rounded-lg shadow-lg border border-gray-100">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loadingMore ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading more transactions...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span>Load More</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  )
}

export default memo(TransactionList)
