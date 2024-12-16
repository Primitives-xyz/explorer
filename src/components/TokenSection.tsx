'use client'

import { formatNumber } from '@/utils/format'
import { FungibleToken } from '@/utils/helius'
import { useEffect, useMemo, useState } from 'react'

const truncateAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  symbol: string
}

const ImageModal = ({ isOpen, onClose, imageUrl, symbol }: ImageModalProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-lg w-full mx-4">
        <div
          className="bg-black/90 border border-green-800 rounded-lg p-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-green-600 hover:text-green-400 font-mono text-sm"
          >
            [close]
          </button>
          <img
            src={imageUrl}
            alt={symbol}
            className="w-full h-auto rounded-lg"
          />
          <div className="text-center mt-2 text-green-500 font-mono text-sm">
            {symbol}
          </div>
        </div>
      </div>
    </div>
  )
}

interface TokenSectionProps {
  walletAddress: string
  hasSearched?: boolean
}

export const TokenSection = ({
  walletAddress,
  hasSearched,
}: TokenSectionProps) => {
  const [expandedTokenId, setExpandedTokenId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'value' | 'balance' | 'symbol'>('value')
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    symbol: string
  } | null>(null)
  const [tokens, setTokens] = useState<FungibleToken[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      if (!walletAddress || !hasSearched) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/tokens?address=${walletAddress}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const tokensData = await response.json()
        if ('error' in tokensData) {
          throw new Error(tokensData.error)
        }
        setTokens(tokensData)
      } catch (error) {
        console.error('Error fetching tokens:', error)
        setError('Failed to fetch tokens.')
        setTokens([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [walletAddress, hasSearched])

  // Calculate total value of tokens
  const totalValue = tokens.reduce((acc, token) => {
    return acc + (token.price || 0) * token.balance
  }, 0)

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

      {error && (
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400">
          <span>! ERROR: {error}</span>
        </div>
      )}

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
                  <div
                    className="relative group cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (token.imageUrl) {
                        setSelectedImage({
                          url: token.imageUrl,
                          symbol: token.symbol,
                        })
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm group-hover:bg-green-500/20 transition-all duration-300"></div>
                    {token.imageUrl ? (
                      <img
                        src={token.imageUrl}
                        alt={token.symbol}
                        className="relative w-10 h-10 rounded-lg object-contain p-1.5 bg-black/40 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300"
                        onError={(e) => {
                          // Hide the broken image and show fallback
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement?.classList.add(
                            'fallback-active',
                          )
                        }}
                      />
                    ) : null}
                    <div
                      className={`relative w-10 h-10 rounded-lg bg-black/40 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300 flex items-center justify-center ${!token.imageUrl ? 'block' : 'hidden fallback'}`}
                    >
                      <span className="text-green-500 font-mono text-sm font-bold">
                        {token.symbol.slice(0, 3)}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-green-400 text-xs font-mono bg-black/60 px-1.5 py-0.5 rounded">
                        [view]
                      </span>
                    </div>
                  </div>
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

      {selectedImage && (
        <ImageModal
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          symbol={selectedImage.symbol}
        />
      )}
    </div>
  )
}
