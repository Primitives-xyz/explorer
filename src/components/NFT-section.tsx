'use client'

import type { FungibleToken, NFT } from '@/utils/types'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
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
  const [animateIn, setAnimateIn] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [hoveredNFT, setHoveredNFT] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<
    'all' | 'compressed' | 'mutable'
  >('all')
  const [hideErroredImages, setHideErroredImages] = useState(false)

  const t = useTranslations('common')

  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const shouldShowContent =
    isLoading || items.length > 0 || (hasSearched && items.length === 0)

  if (!shouldShowContent) return null

  // Filter items based on selected filter
  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true
    if (filterType === 'compressed') return item.compressed
    if (filterType === 'mutable') return item.mutable
    return true
  })

  // Count of each type for the filter buttons
  const counts = {
    all: items.length,
    compressed: items.filter((item) => item.compressed).length,
    mutable: items.filter((item) => item.mutable).length,
  }

  return (
    <div
      className={`border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col relative transition-opacity duration-300 ${
        animateIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Header */}
      {!hideTitle && (
        <div className="border-b border-green-800 p-2 flex-shrink-0 bg-black/30">
          <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
            <div className="text-sm font-mono whitespace-nowrap flex items-center">
              <span className="text-green-500 mr-1">{'>'}</span>
              <span className="text-green-300">NFTs</span>
              <span className="ml-2 text-xs text-green-500/70 border border-green-800/50 rounded px-1.5 py-0.5">
                {filteredItems.length}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Filter options */}
              <div className="flex space-x-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-0.5 text-xs rounded flex items-center ${
                    filterType === 'all'
                      ? 'bg-green-800/50 text-green-300'
                      : 'bg-black/30 text-green-500/70 hover:bg-green-900/30'
                  } transition-colors`}
                >
                  <span>All</span>
                  <span className="ml-1 text-[10px] opacity-70">
                    ({counts.all})
                  </span>
                </button>
                {counts.compressed > 0 && (
                  <button
                    onClick={() => setFilterType('compressed')}
                    className={`px-2 py-0.5 text-xs rounded flex items-center ${
                      filterType === 'compressed'
                        ? 'bg-green-800/50 text-green-300'
                        : 'bg-black/30 text-green-500/70 hover:bg-green-900/30'
                    } transition-colors`}
                  >
                    <span>Compressed</span>
                    <span className="ml-1 text-[10px] opacity-70">
                      ({counts.compressed})
                    </span>
                  </button>
                )}
                {counts.mutable > 0 && (
                  <button
                    onClick={() => setFilterType('mutable')}
                    className={`px-2 py-0.5 text-xs rounded flex items-center ${
                      filterType === 'mutable'
                        ? 'bg-green-800/50 text-green-300'
                        : 'bg-black/30 text-green-500/70 hover:bg-green-900/30'
                    } transition-colors`}
                  >
                    <span>Mutable</span>
                    <span className="ml-1 text-[10px] opacity-70">
                      ({counts.mutable})
                    </span>
                  </button>
                )}
              </div>

              {/* View mode toggle */}
              <div className="flex space-x-1 border-l border-green-800/30 pl-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-0.5 text-xs rounded ${
                    viewMode === 'grid'
                      ? 'bg-green-800/50 text-green-300'
                      : 'bg-black/30 text-green-500/70 hover:bg-green-900/30'
                  } transition-colors`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-0.5 text-xs rounded ${
                    viewMode === 'list'
                      ? 'bg-green-800/50 text-green-300'
                      : 'bg-black/30 text-green-500/70 hover:bg-green-900/30'
                  } transition-colors`}
                >
                  List
                </button>
              </div>

              {/* Hide errored images toggle */}
              <div className="flex space-x-1 border-l border-green-800/30 pl-2">
                <button
                  onClick={() => setHideErroredImages(!hideErroredImages)}
                  className={`px-2 py-0.5 text-xs rounded flex items-center ${
                    hideErroredImages
                      ? 'bg-green-800/50 text-green-300'
                      : 'bg-black/30 text-green-500/70 hover:bg-green-900/30'
                  } transition-colors`}
                >
                  <span>{hideErroredImages ? 'Show All' : 'Hide Errors'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 border-b border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span className="uppercase flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {t('error')}: {error}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="font-mono text-green-300">
              <span className="inline-block animate-pulse">{t('loading')}</span>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-3xl mb-4">🖼️</div>
            <div className="font-mono text-green-300 mb-2">
              {filterType !== 'all' ? `No ${filterType} NFTs found` : t('nfts')}
            </div>
            <p className="text-sm text-green-500/70 max-w-md">
              {filterType !== 'all'
                ? `Try selecting a different filter option.`
                : `No NFTs were found for this wallet.`}
            </p>
          </div>
        ) : (
          <div className="transition-opacity duration-300">
            <NFTGrid
              tokens={filteredItems}
              onImageClick={(url, symbol) => setSelectedImage({ url, symbol })}
              viewMode={viewMode}
              onHover={setHoveredNFT}
              hoveredNFT={hoveredNFT}
              hideErroredImages={hideErroredImages}
            />
          </div>
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
