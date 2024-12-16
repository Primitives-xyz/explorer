'use client'

import { formatNumber } from '@/utils/format'
import { FungibleToken } from '@/utils/helius'
import { useEffect, useMemo, useState } from 'react'
import { ImageModal } from './tokens/ImageModal'
import { SortControls } from './tokens/SortControls'
import { TokenListItem } from './tokens/TokenListItem'

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
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="border-b border-green-800 p-2 flex-shrink-0">
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
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span>! ERROR: {error}</span>
        </div>
      )}

      {/* Sort Controls */}
      {tokens.length > 0 && !isLoading && (
        <div className="flex-shrink-0">
          <SortControls sortBy={sortBy} onSort={setSortBy} />
        </div>
      )}

      {/* Token List */}
      <div className="divide-y divide-green-800/30 overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
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
            <TokenListItem
              key={token.id}
              token={token}
              totalValue={totalValue}
              expandedTokenId={expandedTokenId}
              onExpand={(id) =>
                setExpandedTokenId(expandedTokenId === id ? null : id)
              }
              onImageClick={(url, symbol) => setSelectedImage({ url, symbol })}
            />
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
