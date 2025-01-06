import { Transaction } from '@/utils/helius/types'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FollowingTransactionFeedProps {
  transactions: Transaction[]
  isLoading: boolean
}

const LAMPORTS_PER_SOL = 1000000000

const formatLamportsToSol = (lamports: number) => {
  const sol = Math.abs(lamports) / LAMPORTS_PER_SOL
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Helper function to detect spam/dust transactions
function isSpamTransaction(tx: Transaction) {
  // Check if it's a multi-transfer with tiny amounts
  if (
    tx.type === 'TRANSFER' &&
    tx.nativeTransfers &&
    tx.nativeTransfers.length > 3
  ) {
    // Check if all transfers are tiny amounts (less than 0.001 SOL)
    const allTinyTransfers = tx.nativeTransfers.every(
      (transfer) => Math.abs(transfer.amount / LAMPORTS_PER_SOL) < 0.001,
    )
    if (allTinyTransfers) return true
  }
  return false
}

const getTransactionTypeColor = (type: string, source: string) => {
  // First check for known marketplaces
  switch (source) {
    case 'MAGIC_EDEN':
      return 'bg-purple-900/50 text-purple-400 border-purple-800'
    case 'TENSOR':
      return 'bg-blue-900/50 text-blue-400 border-blue-800'
    case 'RAYDIUM':
      return 'bg-teal-900/50 text-teal-400 border-teal-800'
    case 'JUPITER':
      return 'bg-orange-900/50 text-orange-400 border-orange-800'
  }

  // Then fall back to transaction type colors
  switch (type) {
    case 'COMPRESSED_NFT_MINT':
      return 'bg-pink-900/50 text-pink-400 border-pink-800'
    case 'TRANSFER':
      return 'bg-blue-900/50 text-blue-400 border-blue-800'
    case 'SWAP':
      return 'bg-orange-900/50 text-orange-400 border-orange-800'
    case 'DEPOSIT':
      return 'bg-green-900/50 text-green-400 border-green-800'
    default:
      return 'bg-gray-900/50 text-gray-400 border-gray-800'
  }
}

const formatAddress = (address: string | undefined | null) => {
  if (!address) return 'Unknown'
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export const FollowingTransactionFeed = ({
  transactions,
  isLoading,
}: FollowingTransactionFeedProps) => {
  const router = useRouter()
  const [expandedTx, setExpandedTx] = useState<string | null>(null)

  // Filter out spam transactions
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
        {isLoading ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> AGGREGATING TRANSACTIONS...'}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO RECENT ACTIVITY'}
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.signature}
              className="p-2 hover:bg-green-900/10 cursor-pointer transition-all duration-200"
              onClick={() =>
                setExpandedTx(expandedTx === tx.signature ? null : tx.signature)
              }
            >
              <div className="flex flex-col gap-1">
                {/* Transaction Signature */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-green-400 hover:text-green-300 font-mono cursor-pointer text-sm transition-colors duration-200 border border-green-800/50 rounded px-2 py-0.5 hover:border-green-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/${tx.signature}`)
                    }}
                    title="Click to view transaction details"
                  >
                    {tx.signature}
                  </span>
                  <a
                    href={`https://solscan.io/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-500 font-mono text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                </div>

                {/* Transaction Info */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-mono">
                      {formatDistanceToNow(new Date(tx.timestamp * 1000), {
                        addSuffix: true,
                      })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded border ${getTransactionTypeColor(
                          tx.type,
                          tx.source,
                        )} text-xs font-mono`}
                      >
                        {tx.type}
                      </span>
                      {tx.source && (
                        <span
                          className={`px-2 py-0.5 rounded border ${getTransactionTypeColor(
                            tx.type,
                            tx.source,
                          )} text-xs font-mono`}
                        >
                          {tx.source}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-green-600 font-mono">
                    {tx.fee ? `${formatLamportsToSol(tx.fee)} SOL` : ''}
                  </span>
                </div>

                {/* Transaction Description */}
                <div className="text-sm text-green-300 font-mono break-words">
                  {tx.description || 'No description available'}
                </div>

                {/* Transfers */}
                <div className="space-y-0.5">
                  {tx.nativeTransfers
                    ?.filter((transfer) => transfer.amount > 0) // Only show non-zero transfers
                    .map((transfer, i) => (
                      <div
                        key={i}
                        className="text-xs text-green-500 font-mono flex items-center gap-1"
                      >
                        <span>
                          {transfer.fromUserAccount === tx.sourceWallet
                            ? '↑'
                            : '↓'}
                        </span>
                        <span>{formatLamportsToSol(transfer.amount)} SOL</span>
                        <span className="text-green-700">
                          {transfer.fromUserAccount === tx.sourceWallet
                            ? 'to'
                            : 'from'}
                        </span>
                        <a
                          href={`https://solscan.io/account/${
                            transfer.fromUserAccount === tx.sourceWallet
                              ? transfer.toUserAccount
                              : transfer.fromUserAccount
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-400 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {formatAddress(
                            transfer.fromUserAccount === tx.sourceWallet
                              ? transfer.toUserAccount
                              : transfer.fromUserAccount,
                          )}
                        </a>
                      </div>
                    ))}
                  {tx.tokenTransfers
                    ?.filter(
                      (transfer) => transfer.amount && transfer.amount > 0,
                    ) // Only show non-zero transfers
                    .map((transfer, i) => {
                      const targetAddress =
                        transfer.from === tx.sourceWallet
                          ? transfer.to
                          : transfer.from

                      return (
                        <div
                          key={i}
                          className="text-xs text-green-500 font-mono flex items-center gap-1"
                        >
                          <span>
                            {transfer.from === tx.sourceWallet ? '↑' : '↓'}
                          </span>
                          <span>
                            {transfer.amount?.toLocaleString() || 0}{' '}
                            {transfer.tokenMint
                              ? `${formatAddress(transfer.tokenMint)}`
                              : 'Unknown'}
                          </span>
                          <span className="text-green-700">
                            {transfer.from === tx.sourceWallet ? 'to' : 'from'}
                          </span>
                          {targetAddress && (
                            <a
                              href={`https://solscan.io/account/${targetAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {formatAddress(targetAddress)}
                            </a>
                          )}
                        </div>
                      )
                    })}
                </div>

                {/* Parsed Instructions (Expanded View) */}
                {expandedTx === tx.signature && tx.parsedInstructions && (
                  <div className="mt-2 space-y-2">
                    <div className="text-xs text-green-400 font-mono">
                      Instructions:
                    </div>
                    {tx.parsedInstructions.map((ix: any, index: number) => (
                      <div
                        key={index}
                        className="pl-2 border-l-2 border-green-800"
                      >
                        <div className="text-xs text-green-500 font-mono">
                          Program: {formatAddress(ix.programId)}
                        </div>
                        {ix.decodedData && (
                          <div className="text-xs text-green-400 font-mono pl-2 mt-1">
                            <pre className="whitespace-pre-wrap break-all">
                              {JSON.stringify(ix.decodedData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
