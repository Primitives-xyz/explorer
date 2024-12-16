import { formatNumber } from '@/utils/format'
import { FungibleToken } from '@/utils/helius'
import { useMemo, useState } from 'react'

const truncateAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

interface TokenSectionProps {
  tokens: FungibleToken[]
  totalValue: number
  isLoading?: boolean
  hasSearched?: boolean
}

export const TokenSection = ({
  tokens,
  totalValue,
  isLoading,
  hasSearched,
}: TokenSectionProps) => {
  const [expandedTokenId, setExpandedTokenId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'value' | 'balance' | 'symbol'>('value')

  const shouldShowContent =
    isLoading || tokens.length > 0 || (hasSearched && tokens.length === 0)

  const sortedTokens = useMemo(
    () =>
      [...tokens].sort((a, b) => {
        switch (sortBy) {
          case 'value':
            return b.balance * (b.price || 0) - a.balance * (a.price || 0)
          case 'balance':
            return b.balance - a.balance
          case 'symbol':
            return a.symbol.localeCompare(b.symbol)
          default:
            return 0
        }
      }),
    [tokens, sortBy],
  )

  if (!shouldShowContent) return null

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-green-800 p-2">
        <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
          <div className="text-green-500 text-sm font-mono whitespace-nowrap">
            {'>'} token_balances.sol
          </div>
          <div className="text-xs text-green-600 font-mono whitespace-nowrap ml-2">
            TOTAL: ${formatNumber(totalValue)} USDC
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      {tokens.length > 0 && !isLoading && (
        <div className="border-b border-green-800/50 p-2 flex gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSortBy('value')}
            className={`text-xs font-mono px-2 py-1 rounded ${
              sortBy === 'value'
                ? 'bg-green-900/30 text-green-400'
                : 'text-green-600 hover:bg-green-900/20'
            }`}
          >
            SORT BY VALUE
          </button>
          <button
            onClick={() => setSortBy('balance')}
            className={`text-xs font-mono px-2 py-1 rounded ${
              sortBy === 'balance'
                ? 'bg-green-900/30 text-green-400'
                : 'text-green-600 hover:bg-green-900/20'
            }`}
          >
            SORT BY BALANCE
          </button>
          <button
            onClick={() => setSortBy('symbol')}
            className={`text-xs font-mono px-2 py-1 rounded ${
              sortBy === 'symbol'
                ? 'bg-green-900/30 text-green-400'
                : 'text-green-600 hover:bg-green-900/20'
            }`}
          >
            SORT BY SYMBOL
          </button>
        </div>
      )}

      {/* Token List */}
      <div className="divide-y divide-green-800/30">
        {isLoading ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> FETCHING TOKENS...'}
          </div>
        ) : hasSearched && tokens.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO TOKENS FOUND'}
          </div>
        ) : (
          sortedTokens.map((token) => (
            <div
              key={token.id}
              className="p-3 hover:bg-green-900/10 cursor-pointer transition-colors"
              onClick={() =>
                setExpandedTokenId(
                  expandedTokenId === token.id ? null : token.id,
                )
              }
            >
              <div className="flex flex-col gap-2 overflow-hidden">
                {/* Token Header */}
                <div className="flex items-center gap-3">
                  {token.imageUrl && (
                    <img
                      src={token.imageUrl}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-sm opacity-80 bg-green-900/20 p-1 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-green-300 font-mono bg-green-900/20 px-1.5 py-0.5 rounded inline-block truncate">
                        {token.symbol}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-green-600/50 text-xs font-mono">
                          {truncateAddress(token.id)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(token.id)
                          }}
                          className="text-green-600/50 hover:text-green-400/80 text-xs font-mono bg-green-900/20 px-1.5 py-0.5 rounded transition-colors"
                        >
                          [copy]
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Token Details */}
                <div className="space-y-1 bg-green-900/5 p-2 rounded text-xs font-mono">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-green-600">Balance:</span>
                        <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                          {formatNumber(token.balance)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-green-600">Value:</span>
                        <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                          ${formatNumber(token.balance * (token.price || 0))}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-green-600">Price:</span>
                        <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                          ${formatNumber(token.price || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-green-600">Share:</span>
                        <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                          {(
                            (token.balance * (token.price || 0) * 100) /
                            totalValue
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTokenId === token.id && (
                  <div className="mt-2 space-y-2 bg-green-900/10 p-3 rounded text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-green-600">Token Address:</span>
                      <div className="text-green-500 bg-green-900/20 px-2 py-1 rounded font-mono text-xs break-all">
                        {token.id}
                      </div>
                    </div>
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
