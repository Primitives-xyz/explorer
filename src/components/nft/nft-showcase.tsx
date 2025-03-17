'use client'

import { Card, CardContent } from '@/components/ui/card'
import { NFT } from '@/utils/types'
import { AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { NFTCard } from './nft-card'
import { NFTLoadingError } from './nft-loading-error'
import { NFTViewToggle } from './nft-view-toggle'
import { ShimmerEffect } from './shimmer-effect'
type ViewMode = 'grid' | 'list'

export interface NFTShowcaseProps {
  nfts: NFT[]
  isLoading: boolean
  error: string | null
}

export default function NFTShowcase({
  nfts,
  isLoading,
  error,
}: NFTShowcaseProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <Card className="bg-black/90 border border-green-800/50 text-white overflow-hidden">
      <CardContent className="p-0">
        {/* Filter/Sort Controls */}
        <div className="border-t border-b border-green-800/30 bg-black/50 p-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-500"
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
                  Loading NFTs...
                </span>
              ) : (
                <>
                  {nfts.length} {nfts.length === 1 ? 'NFT' : 'NFTs'} found
                </>
              )}
            </div>

            {/* View mode toggle */}
            <NFTViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>

          {/* <div className="flex flex-wrap items-center gap-3 w-full md:w-auto"> */}
          {/* Search input */}
          {/* <NFTSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            /> */}

          {/* Sort options */}
          {/* <NFTSortSelector
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          </div> */}
        </div>

        {/* Content */}
        <div
          ref={containerRef}
          className="p-2 max-h-[800px] overflow-y-auto scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50"
        >
          {isLoading ? (
            <ShimmerEffect />
          ) : error ? (
            <NFTLoadingError error={error} />
          ) : nfts.length === 0 ? (
            <></>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'
                  : 'flex flex-col gap-4'
              }
            >
              <AnimatePresence>
                {nfts.map((nft, index) => (
                  <NFTCard key={nft.id} nft={nft} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
