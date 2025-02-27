'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useNFTData } from '@/hooks/use-nft-data'
import { useNFTImage } from '@/hooks/use-nft-image'
import { NFT, TokenWithInscription } from '@/utils/types'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { ImageModal } from './tokens/image-modal'
import { TokenAddress } from './tokens/token-address'

// Shimmer loading effect component
const ShimmerEffect = () => (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-green-900/20 to-green-800/10"></div>
          <div className="p-3 space-y-2">
            <div className="h-4 bg-green-900/20 rounded w-3/4"></div>
            <div className="h-3 bg-green-900/10 rounded w-1/2"></div>
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
  onImageClick,
}: {
  nft: NFT | TokenWithInscription
  index: number
  onImageClick: (url: string, symbol: string) => void
}) => {
  const { url: imageUrl, isLoading: imageLoading } = useNFTImage(nft.content)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Determine if it's an inscription
  const isInscription = 'inscription' in nft

  // Format attributes for display
  const attributes = nft.content?.metadata?.attributes || []
  const displayAttributes = attributes.slice(0, 3)

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="relative bg-black/80 border border-green-800/40 rounded-xl overflow-hidden group"
        whileHover={{
          y: -5,
          boxShadow: '0 10px 30px -10px rgba(0, 255, 170, 0.2)',
          borderColor: 'rgba(0, 255, 170, 0.4)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* NFT Image */}
        <div className="relative aspect-square overflow-hidden">
          {imageLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse w-full h-full bg-gradient-to-br from-green-900/40 to-green-800/20" />
            </div>
          ) : imageUrl ? (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 z-10 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
              <motion.img
                src={imageUrl}
                alt={nft.name}
                className="w-full h-full object-cover"
                onClick={() => onImageClick(imageUrl, nft.name)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ y: 20, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-bold truncate text-white drop-shadow-lg">
                  {nft.name}
                </h3>
                {nft.symbol && (
                  <p className="text-sm text-green-300 truncate drop-shadow-lg">
                    {nft.symbol}
                  </p>
                )}
              </motion.div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-green-900/10 text-green-500">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-30">
            {nft.compressed && (
              <Badge className="bg-green-500/80 text-black font-medium">
                Compressed
              </Badge>
            )}
            {isInscription && (
              <Badge className="bg-purple-500/80 text-white font-medium">
                Inscription #{(nft as TokenWithInscription).inscription.order}
              </Badge>
            )}
            {nft.mutable && (
              <Badge className="bg-yellow-500/80 text-black font-medium">
                Mutable
              </Badge>
            )}
          </div>
        </div>

        {/* NFT Details */}
        <div className="p-3 space-y-2">
          <h3 className="font-bold truncate">{nft.name}</h3>
          Creator
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

        {/* Hover effect glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? '0 0 20px 2px rgba(0, 255, 170, 0.3), inset 0 0 20px 2px rgba(0, 255, 170, 0.1)'
              : '0 0 0px 0px rgba(0, 255, 170, 0)',
          }}
          transition={{ duration: 0.3 }}
        />
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
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    symbol: string
  } | null>(null)
  const [sortOption, setSortOption] = useState<'default' | 'name' | 'newest'>(
    'default'
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  // Sort NFTs based on selected option
  const sortedNFTs = [...nfts].sort((a, b) => {
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortOption === 'newest') {
      // This is a placeholder - in a real app you'd use creation date
      return b.id.localeCompare(a.id)
    }
    return 0
  })

  return (
    <Card className="bg-black/90 border border-green-800/50 text-white overflow-hidden">
      <CardContent className="p-0">
        {/* Filter/Sort Controls */}
        <div className="border-t border-b border-green-800/30 bg-black/50 p-3 flex justify-between items-center">
          <div className="text-sm font-medium">
            {nfts.length} {nfts.length === 1 ? 'NFT' : 'NFTs'} found
          </div>
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
            </select>
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
            <div className="p-4 border border-red-800/50 bg-red-900/20 text-red-400 rounded-lg">
              <p className="font-medium">Error loading NFTs</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : nfts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🖼️</div>
              <h3 className="text-xl font-medium mb-2">No NFTs Found</h3>
              <p className="text-green-400/70">
                This wallet doesn't have any NFTs yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {sortedNFTs.map((nft, index) => (
                  <NFTCard
                    key={nft.id}
                    nft={nft}
                    index={index}
                    onImageClick={(url, symbol) =>
                      setSelectedImage({ url, symbol })
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </CardContent>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          symbol={selectedImage.symbol}
        />
      )}
    </Card>
  )
}
