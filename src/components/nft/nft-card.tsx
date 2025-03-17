import { useNftBuy } from '@/hooks/use-nft-buy'
import { useNftCancelListing } from '@/hooks/use-nft-cancel-listing'
import { NFT } from '@/utils/types'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { NFTAttributes } from './nft-attributes'
import { NFTBadges } from './nft-badges'
import { NFTChangePriceModal } from './nft-change-price-modal'
import { NFTImage } from './nft-image'
import { NFTListingModal } from './nft-listing-modal'

// Main NFT Card component that renders either grid or list view
export function NFTCard({
  nft,
  index,
  refreshNFTs,
}: {
  nft: NFT
  index: number
  refreshNFTs: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { walletAddress } = useCurrentWallet()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [isListingModalOpen, setIsListingModalOpen] = useState(false)
  const [isChangePriceModalOpen, setIsChangePriceModalOpen] = useState(false)
  const { handleNftCancelListing, showNftCancelLoading } = useNftCancelListing(
    nft,
    refreshNFTs
  )
  const { handleNftBuy, showNftBuyLoading } = useNftBuy(nft, refreshNFTs)

  const navigateToNFTPage = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/${nft.id}`)
  }

  const handleListForSale = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsListingModalOpen(true)
  }

  const handleCancelListing = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleNftCancelListing()
  }

  const handleChangePrice = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsChangePriceModalOpen(true)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleNftBuy()
  }

  const isOwner = walletAddress === nft.owner
  const isListed = nft.marketplace?.listed

  const collectionName = nft.metadata.collection?.name
  const price = nft.price?.amount
  const currency = nft.price?.currency || 'SOL'

  // Determine if we should show action buttons
  const showActionButtons = (isListed && !isOwner) || isOwner

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="relative group"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.div
          className="relative bg-gradient-to-b from-black/90 to-black/95 border border-green-800/40 rounded-xl overflow-hidden cursor-pointer shadow-lg"
          whileHover={{
            y: -5,
            boxShadow: '0 15px 30px -10px rgba(0, 255, 170, 0.3)',
            borderColor: 'rgba(0, 255, 170, 0.5)',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={navigateToNFTPage}
        >
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none z-10" />

          {/* Image container with hover effect */}
          <div className="relative aspect-square overflow-hidden">
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <NFTImage nft={nft} onClick={navigateToNFTPage} viewMode="grid" />
            </motion.div>

            {/* Badges */}
            <NFTBadges nft={nft} viewMode="grid" />

            {/* Price tag if listed - moved to image overlay for better visibility */}
            {isListed && price && (
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium z-20 flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500/30 flex items-center justify-center">
                  <span className="text-green-400 text-[10px]">◎</span>
                </div>
                <span className="text-white font-bold">
                  {price} {currency}
                </span>
              </div>
            )}
          </div>

          {/* Content section - simplified */}
          <div className="p-3 space-y-2 h-[140px] flex flex-col">
            {/* Collection name with verified badge if applicable */}
            {collectionName && (
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-green-400/90 font-medium truncate">
                  {collectionName}
                </p>
                {nft.metadata.collection?.verified && (
                  <svg
                    className="w-3 h-3 text-blue-500 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
            )}

            {/* NFT name with truncation */}
            <h3 className="font-bold text-base truncate text-white/95">
              {nft.name || 'NFT'}
            </h3>

            <div className="mt-auto">
              {/* Buy button if listed and not owner */}
              {isListed && !isOwner && price && (
                <motion.button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black text-xs font-bold py-1.5 px-3 rounded-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  disabled={showNftBuyLoading}
                >
                  {showNftBuyLoading ? 'Processing...' : 'Buy Now'}
                </motion.button>
              )}

              {/* Owner actions if listed */}
              {isOwner && isListed && (
                <div className="grid grid-cols-2 gap-2">
                  {/* Change Price button */}
                  <motion.button
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white text-xs font-bold py-1.5 px-2 rounded-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChangePrice}
                  >
                    Change Price
                  </motion.button>

                  {/* Cancel Listing button */}
                  <motion.button
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white text-xs font-bold py-1.5 px-2 rounded-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelListing}
                    disabled={showNftCancelLoading}
                  >
                    {showNftCancelLoading ? 'Canceling...' : 'Cancel'}
                  </motion.button>
                </div>
              )}

              {/* List for Sale button if owned by user and not listed */}
              {isOwner && !isListed && (
                <motion.button
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-bold py-1.5 px-3 rounded-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleListForSale}
                >
                  List for Sale
                </motion.button>
              )}

              {/* Attributes - only show if no action buttons are displayed */}
              {!showActionButtons && (
                <NFTAttributes nft={nft} viewMode="grid" />
              )}
            </div>
          </div>

          {/* Hover effect glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-xl"
            animate={{
              boxShadow: isHovered
                ? 'inset 0 0 20px 5px rgba(0, 255, 170, 0.1)'
                : 'inset 0 0 0px 0px rgba(0, 255, 170, 0)',
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.div>

      {/* Listing Modal */}
      <NFTListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        nft={nft}
        refreshNFTs={refreshNFTs}
      />

      {/* Change Price Modal */}
      <NFTChangePriceModal
        isOpen={isChangePriceModalOpen}
        onClose={() => setIsChangePriceModalOpen(false)}
        nft={nft}
        refreshNFTs={refreshNFTs}
      />
    </>
  )
}
