'use client'

import type { FungibleToken, NFT } from '@/utils/types'
import { useState } from 'react'
import { ImageModal } from './tokens/image-modal'
import { NFTGrid } from './tokens/NFT-grid'

interface NFTSectionProps {
  hasSearched?: boolean
  tokenType?: 'all' | 'fungible' | 'nft' | 'compressed' | 'programmable'
  hideTitle?: boolean
  isLoading: boolean
  error?: string
  items?: (FungibleToken | NFT)[]
}

export const NFTSection = ({
  hasSearched,
  tokenType = 'all',
  hideTitle = false,
  isLoading,
  error,
  items = [],
}: NFTSectionProps) => {
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    symbol: string
  } | null>(null)

  const shouldShowContent =
    isLoading || items.length > 0 || (hasSearched && items.length === 0)

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
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col relative group h-[484px] lg:h-[600px]">
      {/* Header */}
      {!hideTitle && (
        <div className="border-b border-green-800 p-3 flex-shrink-0">
          <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
            <div className="text-green-500 text-sm font-mono whitespace-nowrap">
              {'>'} {getTitle()}
            </div>
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
        ) : items.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO TOKENS FOUND'}
          </div>
        ) : (
          <NFTGrid
            tokens={items}
            onImageClick={(url, symbol) => setSelectedImage({ url, symbol })}
          />
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
