'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useNFTData } from '@/hooks/use-nft-data'
import { useNFTImage } from '@/hooks/use-nft-image'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { DAS } from 'helius-sdk/dist/src/types/das-types'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { TokenAddress } from './tokens/token-address'

// Shimmer loading effect component
const ShimmerEffect = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="h-6 bg-green-900/20 rounded w-32 animate-pulse"></div>
      <div className="flex gap-3">
        <div className="h-8 bg-green-900/20 rounded w-48 animate-pulse"></div>
        <div className="h-8 bg-green-900/20 rounded w-32 animate-pulse"></div>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden border border-green-800/30 bg-black/80"
        >
          <div className="aspect-square bg-gradient-to-br from-green-900/30 to-green-800/20 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-500/20 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L13.5099 16M14.1666 11.5C14.1666 11.5 15.5 10.5 16.5 10.5C17.5 10.5 18.8333 11.5 18.8333 11.5M6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25Z"
              ></path>
            </svg>
          </div>
          <div className="p-3 space-y-3">
            <div className="h-5 bg-green-900/30 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-green-900/20 rounded w-1/2 animate-pulse"></div>
            <div className="flex gap-1 pt-1">
              <div className="h-4 bg-green-900/20 rounded-full w-16 animate-pulse"></div>
              <div className="h-4 bg-green-900/20 rounded-full w-14 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// NFT Card component with advanced animations and effects
const NFTCard = ({
  nft,
  index,
  viewMode,
  rarityData,
}: {
  nft: DAS.GetAssetResponse
  index: number
  viewMode: 'grid' | 'list'
  rarityData: Record<string, Record<string, number>>
}) => {
  const { url: imageUrl, isLoading: imageLoading } = useNFTImage(nft.content)
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Determine if it's an inscription

  // Format attributes for display
  const attributes = nft.content?.metadata?.attributes || []
  const displayAttributes = attributes.slice(0, viewMode === 'grid' ? 3 : 6)

  // Calculate rarity score (simple implementation)
  const rarityScore = attributes.length > 0 ? attributes.length * 10 : 0

  // Navigate to NFT detail page
  const navigateToNFTPage = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/${nft.id}`)
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="relative"
      >
        <motion.div
          className="relative bg-black/80 border border-green-800/40 rounded-xl overflow-hidden group cursor-pointer"
          whileHover={{
            y: -5,
            boxShadow: '0 10px 30px -10px rgba(0, 255, 170, 0.2)',
            borderColor: 'rgba(0, 255, 170, 0.4)',
          }}
          transition={{ duration: 0.2 }}
          onClick={navigateToNFTPage}
        >
          {/* NFT Image */}
          <div className="relative aspect-square overflow-hidden">
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-black/40">
                <svg
                  className="w-10 h-10 text-green-500/40 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L13.5099 16M14.1666 11.5C14.1666 11.5 15.5 10.5 16.5 10.5C17.5 10.5 18.8333 11.5 18.8333 11.5M6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25Z"
                  ></path>
                </svg>
              </div>
            ) : imageUrl ? (
              <motion.img
                src={imageUrl}
                alt={nft.content?.metadata?.name || 'NFT'}
                className="w-full h-full object-cover"
                onClick={navigateToNFTPage}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-900/10 text-green-500">
                No Image
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 z-30">
              {nft.compression?.compressed && (
                <Badge className="bg-green-500/80 text-black font-medium">
                  Compressed
                </Badge>
              )}

              {nft.mutable && (
                <Badge className="bg-yellow-500/80 text-black font-medium">
                  Mutable
                </Badge>
              )}
              {rarityScore > 30 && (
                <Badge className="bg-blue-500/80 text-white font-medium">
                  Rare
                </Badge>
              )}
            </div>
          </div>

          {/* NFT Details */}
          <div className="p-3 space-y-2">
            <h3 className="font-bold truncate">
              {nft.content?.metadata?.name || 'NFT'}
            </h3>
            <div className="text-xs text-green-400/80 flex items-center gap-1">
              <span className="text-green-500/50">Creator:</span>
              {nft.creators &&
              nft.creators.length > 0 &&
              typeof nft.creators[0] === 'string' ? (
                <TokenAddress address={nft.creators[0] ?? ''} />
              ) : (
                'Unknown'
              )}
            </div>

            {/* Attributes */}
            {displayAttributes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {displayAttributes.map((attr, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-1.5 py-0.5 bg-green-900/20 text-green-400 rounded-full"
                  >
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
                {attributes.length > 3 && (
                  <span className="text-xs px-1.5 py-0.5 bg-green-900/20 text-green-400 rounded-full">
                    +{attributes.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // List view
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative w-full"
    >
      <motion.div
        className="relative bg-black/80 border border-green-800/40 rounded-xl overflow-hidden group cursor-pointer"
        whileHover={{
          boxShadow: '0 5px 15px -5px rgba(0, 255, 170, 0.2)',
          borderColor: 'rgba(0, 255, 170, 0.4)',
        }}
        transition={{ duration: 0.2 }}
        onClick={navigateToNFTPage}
      >
        <div className="flex flex-col md:flex-row">
          {/* NFT Image - smaller in list view */}
          <div className="relative md:w-48 h-48 overflow-hidden">
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-black/40">
                <svg
                  className="w-10 h-10 text-green-500/40 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L13.5099 16M14.1666 11.5C14.1666 11.5 15.5 10.5 16.5 10.5C17.5 10.5 18.8333 11.5 18.8333 11.5M6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25Z"
                  ></path>
                </svg>
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={nft.content?.metadata?.name || 'NFT'}
                className="w-full h-full object-cover cursor-pointer"
                onClick={navigateToNFTPage}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-900/10 text-green-500">
                No Image
              </div>
            )}

            {/* Badges - positioned differently in list view */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-30">
              {nft.compression?.compressed && (
                <Badge className="bg-green-500/80 text-black text-xs font-medium">
                  Compressed
                </Badge>
              )}
            </div>
          </div>

          {/* NFT Details - expanded in list view */}
          <div className="p-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">
                  {nft.content?.metadata?.name || 'NFT'}
                </h3>
                {nft.content?.metadata?.symbol && (
                  <p className="text-sm text-green-400">
                    {nft.content?.metadata?.symbol}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                {nft.mutable && (
                  <Badge className="bg-yellow-500/80 text-black text-xs">
                    Mutable
                  </Badge>
                )}
                {rarityScore > 30 && (
                  <Badge className="bg-blue-500/80 text-white text-xs">
                    Rare
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {/* Creator */}
              <div className="flex items-center gap-1">
                <span className="text-green-500/50">Creator:</span>
                {nft.creators &&
                nft.creators.length > 0 &&
                typeof nft.creators[0] === 'string' ? (
                  <TokenAddress address={nft.creators[0] ?? ''} />
                ) : (
                  'Unknown'
                )}
              </div>

              {/* Mint */}
              <div className="flex items-center gap-1">
                <span className="text-green-500/50">Mint:</span>
                <TokenAddress address={nft.id} />
              </div>

              {/* Interface */}
              <div>
                <span className="text-green-500/50">Type:</span>{' '}
                <span className="text-green-400">{nft.interface}</span>
              </div>
            </div>

            {/* Attributes with rarity */}
            {displayAttributes.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-green-500/70 mb-1">
                  Attributes:
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {displayAttributes.map((attr, idx) => {
                    // Calculate rarity percentage if data is available
                    const traitType = attr.trait_type
                    const traitValue = attr.value
                    const totalWithTrait =
                      rarityData[traitType]?.[traitValue] || 0
                    const totalNFTs =
                      Object.values(rarityData[traitType] || {}).reduce(
                        (sum, count) => sum + count,
                        0
                      ) || 1
                    const rarityPercentage =
                      totalWithTrait > 0
                        ? (totalWithTrait / totalNFTs) * 100
                        : 0

                    return (
                      <div
                        key={idx}
                        className="flex justify-between text-xs px-2 py-1 bg-green-900/20 rounded-md"
                      >
                        <div>
                          <span className="text-green-400">
                            {attr.trait_type}:
                          </span>{' '}
                          {attr.value}
                        </div>
                        {rarityPercentage > 0 && (
                          <div className="text-xs text-green-300">
                            {rarityPercentage < 10 ? (
                              <span className="text-blue-400">
                                {rarityPercentage.toFixed(1)}%
                              </span>
                            ) : (
                              <span>{rarityPercentage.toFixed(1)}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {attributes.length > 6 && (
                  <div className="text-xs text-green-400 mt-1">
                    +{attributes.length - 6} more attributes
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function NFTShowcase({
  walletAddress,
}: {
  walletAddress: string
}) {
  const { nfts, isLoading, error } = useNFTData(walletAddress)
  const [sortOption, setSortOption] = useState<
    'default' | 'name' | 'newest' | 'rarity' | 'attributes'
  >('default')
  const [filterOption, setFilterOption] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showTraitFilters, setShowTraitFilters] = useState(false)
  const [selectedTraits, setSelectedTraits] = useState<
    Record<string, string[]>
  >({})
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])
  const router = useRouter()

  // Extract all unique collections
  const collections = useMemo(() => {
    const collectionSet = new Set<string>()
    nfts.forEach((nft) => {
      if (nft.grouping && nft.grouping.length > 0) {
        const grouping = nft.grouping[0]
        collectionSet.add(
          grouping.collection_metadata?.name || 'Unknown Collection'
        )
      }
    })
    return ['all', ...Array.from(collectionSet)]
  }, [nfts])

  // Calculate trait rarity data and extract unique traits
  const { rarityData, traitTypes } = useMemo(() => {
    const data: Record<string, Record<string, number>> = {}
    const types: string[] = []

    // Count occurrences of each trait value
    nfts.forEach((nft) => {
      const attributes = nft.content?.metadata?.attributes || []
      attributes.forEach((attr) => {
        const { trait_type, value } = attr
        if (!data[trait_type]) {
          data[trait_type] = {}
          types.push(trait_type)
        }
        if (!data[trait_type][value]) {
          data[trait_type][value] = 0
        }
        data[trait_type][value]++
      })
    })

    return { rarityData: data, traitTypes: types }
  }, [nfts])

  // Toggle trait selection
  const toggleTrait = (traitType: string, traitValue: string) => {
    setSelectedTraits((prev) => {
      const newTraits = { ...prev }

      if (!newTraits[traitType]) {
        newTraits[traitType] = [traitValue]
      } else if (newTraits[traitType].includes(traitValue)) {
        newTraits[traitType] = newTraits[traitType].filter(
          (v) => v !== traitValue
        )
        if (newTraits[traitType].length === 0) {
          delete newTraits[traitType]
        }
      } else {
        newTraits[traitType] = [...newTraits[traitType], traitValue]
      }

      return newTraits
    })
  }

  // Clear all trait filters
  const clearTraitFilters = () => {
    setSelectedTraits({})
  }

  // Filter NFTs based on search term only (removed collection and trait filtering)
  const filteredNFTs = useMemo(() => {
    return nfts.filter((nft) => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const nameMatch = nft.content?.metadata?.name
          ?.toLowerCase()
          .includes(searchLower)
        const symbolMatch =
          nft.content?.metadata?.symbol?.toLowerCase().includes(searchLower) ||
          false
        const attributeMatch =
          nft.content?.metadata?.attributes?.some(
            (attr) =>
              attr.trait_type.toLowerCase().includes(searchLower) ||
              attr.value.toString().toLowerCase().includes(searchLower)
          ) || false

        if (!(nameMatch || symbolMatch || attributeMatch)) return false
      }

      return true
    })
  }, [nfts, searchTerm])

  // Sort NFTs based on selected option
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    if (sortOption === 'name') {
      const nameA = a.content?.metadata?.name || ''
      const nameB = b.content?.metadata?.name || ''
      return nameA.localeCompare(nameB)
    } else if (sortOption === 'newest') {
      // This is a placeholder - in a real app you'd use creation date
      return b.id.localeCompare(a.id)
    } else if (sortOption === 'rarity') {
      // Sort by number of attributes as a simple rarity indicator
      const aAttrs = a.content?.metadata?.attributes?.length || 0
      const bAttrs = b.content?.metadata?.attributes?.length || 0
      return bAttrs - aAttrs
    } else if (sortOption === 'attributes') {
      // Sort by total number of attributes
      const aAttrs = a.content?.metadata?.attributes?.length || 0
      const bAttrs = b.content?.metadata?.attributes?.length || 0
      return bAttrs - aAttrs
    }
    return 0
  })

  // Count active filters
  const activeFilterCount = Object.values(selectedTraits).reduce(
    (count, values) => count + values.length,
    0
  )

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
                  {filteredNFTs.length}{' '}
                  {filteredNFTs.length === 1 ? 'NFT' : 'NFTs'} found
                </>
              )}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center bg-black/50 rounded-md border border-green-800/30 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 text-xs rounded-sm ${
                  viewMode === 'grid'
                    ? 'bg-green-800/30 text-green-400'
                    : 'text-green-500/70 hover:text-green-400'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 text-xs rounded-sm ${
                  viewMode === 'list'
                    ? 'bg-green-800/30 text-green-400'
                    : 'text-green-500/70 hover:text-green-400'
                }`}
              >
                List
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search input */}
            <div className="relative flex-grow md:flex-grow-0 md:w-48">
              <input
                type="text"
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/80 border border-green-800/50 text-green-400 text-sm rounded-md p-1.5 pl-8"
              />
              <span className="absolute left-2.5 top-2 text-green-500/50">
                🔍
              </span>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-400">Sort by:</span>
              <select
                className="bg-black/80 border border-green-800/50 text-green-400 text-sm rounded-md p-1"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
              >
                <option value="default">Default</option>
                <option value="name">Name</option>
                <option value="newest">Newest</option>
                <option value="rarity">Rarity</option>
                <option value="attributes">Attributes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          ref={containerRef}
          className="p-6 max-h-[800px] overflow-y-auto scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50"
        >
          {isLoading ? (
            <ShimmerEffect />
          ) : error ? (
            <div className="p-6 border border-red-800/50 bg-red-900/20 text-red-400 rounded-lg flex flex-col items-center">
              <svg
                className="w-12 h-12 text-red-500/70 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="font-medium text-lg mb-1">Error loading NFTs</p>
              <p className="text-sm text-center max-w-md">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-900/30 hover:bg-red-800/40 border border-red-800/50 rounded-md text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredNFTs.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <svg
                className="w-16 h-16 text-green-500/40 mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L13.5099 16M14.1666 11.5C14.1666 11.5 15.5 10.5 16.5 10.5C17.5 10.5 18.8333 11.5 18.8333 11.5M6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25Z"
                ></path>
              </svg>
              <h3 className="text-xl font-medium mb-3">No NFTs Found</h3>
              <p className="text-green-400/70 max-w-md">
                {searchTerm
                  ? 'No NFTs match your search criteria. Try adjusting your search or clearing filters.'
                  : "This wallet doesn't have any NFTs yet."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-green-900/30 hover:bg-green-800/40 border border-green-800/50 rounded-md text-sm transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              <AnimatePresence>
                {sortedNFTs.map((nft, index) => (
                  <NFTCard
                    key={nft.id}
                    nft={nft}
                    index={index}
                    viewMode={viewMode}
                    rarityData={rarityData}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
