import { useCollectionStats } from '@/hooks/use-collection-stats'
import { useNftListing } from '@/hooks/use-nft-listing'
import { NFT } from '@/utils/types'
import { motion } from 'framer-motion'
import {
  AlertTriangleIcon,
  BarChart3Icon,
  CheckCircleIcon,
  DollarSignIcon,
  TagIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Modal } from '../common/modal'
import { Tooltip, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface NFTListingModalProps {
  isOpen: boolean
  onClose: () => void
  nft: NFT
  refreshNFTs: () => void
}

// Define the type for price suggestions
interface PriceSuggestion {
  label: string
  multiplier?: number
  value?: number
  tooltip: string
}

export function NFTListingModal({
  isOpen,
  onClose,
  nft,
  refreshNFTs,
}: NFTListingModalProps) {
  const { handleNftList, listAmount, setListAmount, showNftListLoading } =
    useNftListing({
      tokenId: nft.id,
      collectionFamily: nft.metadata?.collection?.family || '',
      refreshNFTs,
    })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [marketInsights, setMarketInsights] = useState<{
    trend: 'up' | 'down' | 'stable'
    percentage: number
  } | null>(null)
  const router = useRouter()

  // Get collection stats if available - only when modal is open
  const collectionSymbol = isOpen
    ? nft.metadata.collection?.family || null
    : null
  const { collectionStat, isLoading: statsLoading } =
    useCollectionStats(collectionSymbol)

  const floorPrice = collectionStat?.floorPrice || 0
  const floorPriceWithFee = collectionStat?.floorPriceWithFee

  // Get market trend data
  useEffect(() => {
    if (
      collectionStat &&
      collectionStat.volume24hr &&
      collectionStat.txns24hr
    ) {
      // Simple trend calculation based on volume and transactions
      const avgPricePerTx = collectionStat.volume24hr / collectionStat.txns24hr
      const trendPercentage = Math.abs(
        ((avgPricePerTx - floorPrice) / floorPrice) * 100
      )

      setMarketInsights({
        trend:
          avgPricePerTx > floorPrice
            ? 'up'
            : avgPricePerTx < floorPrice
            ? 'down'
            : 'stable',
        percentage: Math.min(trendPercentage, 100), // Cap at 100%
      })
    }
  }, [collectionStat, floorPrice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Call the handleNftList function from the hook
      await handleNftList()
      onClose()
    } catch (error) {
      console.error('Error initiating listing:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading animation component
  const LoadingSpinner = () => (
    <div className="relative">
      {/* Outer ring */}
      <div className="absolute inset-0 border-2 border-green-400/20 rounded-full"></div>
      {/* Inner spinning ring */}
      <div className="absolute inset-0 border-2 border-green-400 rounded-full border-t-transparent animate-spin"></div>
      {/* Center dot */}
      <div className="absolute inset-[2px] bg-green-400/10 rounded-full"></div>
    </div>
  )

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12">
          <LoadingSpinner />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-green-400 mb-1">
            Listing Your NFT
          </h3>
          <p className="text-sm text-gray-400">
            Please wait while we process your request...
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-48 h-1 bg-green-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-green-500 to-green-400 animate-progress-indeterminate"></div>
        </div>
      </div>
    </div>
  )

  // Generate price suggestions based on floor and market data
  const generatePriceSuggestions = () => {
    if (!floorPrice) return []

    const suggestions: PriceSuggestion[] = [
      {
        label: 'Below Floor',
        multiplier: 0.9,
        tooltip: 'List below floor for faster sales',
      },
      { label: 'Floor', multiplier: 1, tooltip: 'List at floor price' },
      {
        label: 'Above Floor',
        multiplier: 1.1,
        tooltip: 'List above floor for higher returns',
      },
    ]

    // Add average price suggestion if available
    if (collectionStat?.avgPrice24hr) {
      suggestions.push({
        label: '24h Avg',
        value: collectionStat.avgPrice24hr,
        tooltip: 'List at the average price from the last 24 hours',
      })
    }

    // Add market-based suggestion if we have insights
    if (marketInsights) {
      const marketMultiplier =
        marketInsights.trend === 'up'
          ? 1.15
          : marketInsights.trend === 'down'
          ? 0.95
          : 1
      suggestions.push({
        label: 'Market Trend',
        multiplier: marketMultiplier,
        tooltip: `Based on recent ${
          marketInsights.trend === 'up'
            ? 'upward'
            : marketInsights.trend === 'down'
            ? 'downward'
            : 'stable'
        } market trend`,
      })
    }

    // Add floor price with fee if available
    if (floorPriceWithFee) {
      suggestions.push({
        label: 'With Fees',
        value: floorPriceWithFee,
        tooltip: 'Floor price including marketplace fees',
      })
    }

    return suggestions
  }

  const priceSuggestions = generatePriceSuggestions()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="List Your NFT"
      className="max-w-md relative"
    >
      {(isSubmitting || showNftListLoading) && <LoadingOverlay />}
      <div className="flex flex-col space-y-4">
        {/* NFT Preview Row */}
        <div className="flex items-center space-x-3 bg-black/30 p-3 rounded-lg">
          {/* NFT Image - Larger size */}
          <div className="relative w-24 h-24 rounded-md overflow-hidden border border-green-500/20 shrink-0">
            {nft.imageUrl ? (
              <Image
                src={nft.imageUrl}
                alt={nft.name || 'NFT'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-900/20">
                <div className="w-8 h-8">
                  <LoadingSpinner />
                </div>
              </div>
            )}
          </div>

          {/* NFT Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white/95 truncate">
              {nft.name || 'NFT'}
            </h3>
            {nft.metadata?.collection?.name && (
              <p className="text-xs text-green-400/90 truncate">
                {nft.metadata.collection.name}
                {nft.metadata.collection.verified && (
                  <span className="inline-block ml-1 text-blue-500">
                    <svg
                      className="w-3 h-3 inline"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </span>
                )}
              </p>
            )}

            {/* Collection Stats Loading State */}
            {statsLoading ? (
              <div className="mt-2 space-y-2">
                <div className="h-3 bg-green-900/20 rounded w-24 animate-pulse"></div>
                <div className="h-3 bg-green-900/20 rounded w-32 animate-pulse"></div>
              </div>
            ) : (
              // Collection Stats Improved Display
              floorPrice > 0 && (
                <div className="flex flex-col gap-1 text-xs text-gray-300 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <TagIcon className="w-3 h-3 mr-1 text-green-400" />
                      Floor:
                      <span className="text-green-400 ml-1">◎{floorPrice}</span>
                    </span>

                    {collectionStat?.listedCount && (
                      <span className="text-gray-400">
                        {collectionStat.listedCount} listed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {collectionStat?.avgPrice24hr && (
                      <span className="flex items-center">
                        <span className="text-gray-400 mr-1">Avg 24h:</span>
                        <span className="text-green-400">
                          ◎{collectionStat.avgPrice24hr.toFixed(3)}
                        </span>
                      </span>
                    )}

                    {collectionStat?.txns24hr && (
                      <span className="text-gray-400">
                        {collectionStat.txns24hr} sales
                      </span>
                    )}
                  </div>

                  {/* Supply and Holders Info */}
                  {(collectionStat?.supply || collectionStat?.holders) && (
                    <div className="flex items-center justify-between">
                      {collectionStat?.supply && (
                        <span className="flex items-center">
                          <span className="text-gray-400 mr-1">Supply:</span>
                          <span className="text-white">
                            {collectionStat.supply.toLocaleString()}
                          </span>
                        </span>
                      )}

                      {collectionStat?.holders && (
                        <span className="flex items-center">
                          <span className="text-gray-400 mr-1">Holders:</span>
                          <span className="text-white">
                            {collectionStat.holders.toLocaleString()}
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Volume Info */}
                  {collectionStat?.volume24hr && (
                    <div className="flex items-center mt-0.5">
                      <BarChart3Icon className="w-3 h-3 mr-1 text-blue-400" />
                      <span className="text-gray-400 mr-1">24h Vol:</span>
                      <span className="text-blue-400">
                        ◎{collectionStat.volume24hr.toFixed(2)}
                      </span>
                      {collectionStat?.volumeAll && (
                        <span className="text-gray-400 ml-2">
                          All-time:{' '}
                          <span className="text-blue-400">
                            ◎{collectionStat.volumeAll.toLocaleString()}
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  {marketInsights && (
                    <span className="flex items-center mt-0.5">
                      {marketInsights.trend === 'up' ? (
                        <TrendingUpIcon className="w-3 h-3 mr-1 text-green-500" />
                      ) : marketInsights.trend === 'down' ? (
                        <TrendingDownIcon className="w-3 h-3 mr-1 text-red-500" />
                      ) : null}
                      <span
                        className={
                          marketInsights.trend === 'up'
                            ? 'text-green-400'
                            : marketInsights.trend === 'down'
                            ? 'text-red-400'
                            : ''
                        }
                      >
                        {marketInsights.trend === 'up'
                          ? 'Trending up'
                          : marketInsights.trend === 'down'
                          ? 'Trending down'
                          : 'Stable'}
                      </span>
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Price Input Section */}
        <div className="bg-black/30 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center">
            <DollarSignIcon className="w-4 h-4 mr-1" />
            Set Your Price
          </h4>

          {/* Price Suggestions */}
          {statsLoading ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 bg-green-900/20 rounded-md w-24 h-[52px] animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          ) : (
            floorPrice > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {priceSuggestions.map((suggestion, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip key={suggestion.label + index}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() =>
                            setListAmount(
                              suggestion.value
                                ? suggestion.value.toFixed(2)
                                : (
                                    floorPrice * (suggestion.multiplier || 1)
                                  ).toFixed(2)
                            )
                          }
                          className="px-3 py-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-md transition-colors flex flex-col items-center"
                        >
                          <span className="text-gray-300 mb-0.5">
                            {suggestion.label}
                          </span>
                          <span className="font-bold text-green-400">
                            ◎{' '}
                            {suggestion.value
                              ? suggestion.value.toFixed(2)
                              : (
                                  floorPrice * (suggestion.multiplier || 1)
                                ).toFixed(2)}
                          </span>
                        </button>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )
          )}

          {/* Price Input */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-green-400 text-lg font-bold">
                  ◎
                </span>
                <input
                  type="number"
                  id="price"
                  value={listAmount}
                  onChange={(e) => setListAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-8 pr-3 py-3 bg-black/50 border border-green-500/30 focus:border-green-500/60 focus:ring-1 focus:ring-green-500/60 rounded-md outline-hidden transition-colors text-lg font-bold"
                  placeholder="0.00"
                  disabled={isSubmitting || showNftListLoading}
                />
              </div>

              {/* Price Feedback */}
              {floorPrice > 0 && listAmount && (
                <div className="flex items-center gap-1 text-xs">
                  {Number(listAmount) < floorPrice * 0.8 ? (
                    <>
                      <AlertTriangleIcon className="w-3 h-3 text-yellow-500 shrink-0" />
                      <span className="text-yellow-500">
                        Significantly below floor price
                      </span>
                    </>
                  ) : Number(listAmount) > floorPrice * 1.5 ? (
                    <>
                      <AlertTriangleIcon className="w-3 h-3 text-yellow-500 shrink-0" />
                      <span className="text-yellow-500">
                        Significantly above floor price
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-3 h-3 text-green-500 shrink-0" />
                      <span className="text-green-500">
                        Within recommended range
                      </span>
                    </>
                  )}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting || !listAmount || showNftListLoading}
                className="w-full bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-md text-base relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">
                  {isSubmitting || showNftListLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4">
                        <LoadingSpinner />
                      </div>
                      Processing...
                    </span>
                  ) : (
                    `List for ◎ ${listAmount || '0.00'}`
                  )}
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
              <p className="text-xs text-center text-gray-400">
                Your NFT will be listed on Magic Eden marketplace
              </p>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
