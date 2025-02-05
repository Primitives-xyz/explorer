'use client'

import { formatNumber } from '@/utils/format'
import type { FungibleToken, NFT } from '@/utils/types'
import { useState } from 'react'
import { ImageModal } from './tokens/ImageModal'
import { NFTGrid } from './tokens/NFTGrid'
import { TokenList } from './tokens/TokenList'

interface TokenSectionProps {
  tokenType?: 'all' | 'fungible' | 'nft' | 'compressed' | 'programmable'
  hideTitle?: boolean
  isLoading: boolean
  error?: string
  items?: (FungibleToken | NFT)[]
}

export const TokenSection = ({
  tokenType = 'all',
  hideTitle = false,
  isLoading,
  error,
  items = [],
}: TokenSectionProps) => {
  const [expandedTokenId, setExpandedTokenId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'value' | 'balance' | 'symbol'>('value')
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    symbol: string
  } | null>(null)

  // Filter items based on token type
  const tokens = items.filter(
    (item: any) =>
      tokenType === 'all' ||
      (tokenType === 'fungible' &&
        (item.interface === 'FungibleToken' ||
          item.interface === 'FungibleAsset')) ||
      (tokenType === 'nft' &&
        (item.interface === 'V1_NFT' ||
          item.interface === 'V2_NFT' ||
          item.interface === 'LEGACY_NFT') &&
        !item.compressed) ||
      (tokenType === 'compressed' &&
        (item.interface === 'V1_NFT' || item.interface === 'V2_NFT') &&
        item.compressed) ||
      (tokenType === 'programmable' && item.interface === 'ProgrammableNFT'),
  )

  const fungibleTokens = tokens.filter(
    (item: any) =>
      item.interface === 'FungibleToken' || item.interface === 'FungibleAsset',
  ) as FungibleToken[]

  const nfts = tokens.filter(
    (item: any) =>
      item.interface === 'V1_NFT' ||
      item.interface === 'V2_NFT' ||
      item.interface === 'ProgrammableNFT' ||
      item.interface === 'LEGACY_NFT',
  ) as NFT[]

  // Calculate total value of tokens
  const totalValue = fungibleTokens.reduce<number>((acc, token) => {
    return acc + (token.price || 0) * token.balance
  }, 0)

  const shouldShowContent = isLoading || tokens.length > 0

  if (!shouldShowContent) return null

  const getTitle = () => {
    switch (tokenType) {
      case 'fungible':
        return 'fungible_tokens'
      case 'nft':
        return 'regular_nfts'
      case 'compressed':
        return 'compressed_nfts'
      case 'programmable':
        return 'programmable_nfts'
      default:
        return 'all_tokens'
    }
  }

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col h-[284px] lg:h-[484px] relative group">
      {/* Header */}
      {!hideTitle && (
        <div className="border-b border-green-800 p-2 flex-shrink-0">
          <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
            <div className="text-green-500 text-sm font-mono whitespace-nowrap">
              {'>'} {getTitle()}
            </div>
            {fungibleTokens.length > 0 && (
              <div className="text-xs text-green-600 font-mono whitespace-nowrap ml-2">
                TOTAL: ${formatNumber(totalValue)} USDC
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span>! ERROR: {error}</span>
        </div>
      )}

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

      {/* Content */}
      <div
        className="overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50 hover-scroll-indicator"
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
            {'>>> FETCHING TOKENS...'}
          </div>
        ) : (
          <>
            {fungibleTokens.length > 0 && (
              <TokenList
                tokens={fungibleTokens}
                totalValue={totalValue}
                expandedTokenId={expandedTokenId}
                onExpand={(id) =>
                  setExpandedTokenId(expandedTokenId === id ? null : id)
                }
                onImageClick={(url, symbol) =>
                  setSelectedImage({ url, symbol })
                }
                sortBy={sortBy}
                onSort={setSortBy}
              />
            )}
            {nfts.length > 0 && (
              <NFTGrid
                tokens={nfts}
                onImageClick={(url, symbol) =>
                  setSelectedImage({ url, symbol })
                }
              />
            )}
          </>
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
