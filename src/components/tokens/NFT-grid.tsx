import { useNFTImage } from '@/hooks/use-nft-image'
import { route } from '@/utils/routes'
import type { FungibleToken, NFT, TokenWithInscription } from '@/utils/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface NFTGridProps {
  tokens: (NFT | TokenWithInscription | FungibleToken)[]
  onImageClick: (url: string, symbol: string) => void
  viewMode?: 'grid' | 'list'
  onHover?: (tokenId: string | null) => void
  hoveredNFT?: string | null
  hideErroredImages?: boolean
}

// Simple NFT card component for both grid and list views
const NFTCard = ({
  token,
  onImageClick,
  onHover,
  isHovered,
  viewMode,
  hideErroredImages,
}: {
  token: NFT | TokenWithInscription | FungibleToken
  onImageClick: (url: string, symbol: string) => void
  onHover?: (tokenId: string | null) => void
  isHovered: boolean
  viewMode: 'grid' | 'list'
  hideErroredImages?: boolean
}) => {
  const router = useRouter()
  const {
    url: imageUrl,
    isLoading: imageLoading,
    error: imageError,
  } = useNFTImage(token.content)
  const [hasImageError, setHasImageError] = useState(false)
  const name = token.name || 'Unnamed Token'

  // If image has error and hideErroredImages is true, don't render this card
  if ((hasImageError || imageError) && hideErroredImages) {
    return null
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return address.slice(0, 6) + '..' + address.slice(-4)
  }

  // Get creator info
  const creator =
    token.creators && token.creators.length > 0
      ? formatAddress(
          typeof token.creators[0] === 'string'
            ? token.creators[0]
            : (token.creators[0] as any).address || 'Unknown'
        )
      : 'Unknown'

  // Handle image error
  const handleImageError = () => {
    setHasImageError(true)
  }

  // List view
  if (viewMode === 'list') {
    return (
      <div
        className={`border border-green-800/30 rounded-md p-3 hover:bg-green-900/10 transition-all duration-200 relative group flex items-center ${
          isHovered
            ? 'bg-green-900/20 border-green-500/30 shadow-lg shadow-green-900/10'
            : ''
        }`}
        onMouseEnter={() => onHover?.(token.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        {/* Image */}
        <div className="relative w-16 h-16 bg-black/20 rounded-md overflow-hidden">
          {imageLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse w-full h-full bg-gradient-to-br from-green-900/20 to-green-800/10" />
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
              onClick={() => onImageClick(imageUrl, name)}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-green-500/50 text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Token Info */}
        <div className="ml-4 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-mono text-sm truncate font-semibold text-green-300 group-hover:text-green-200 transition-colors">
                {name}
              </div>
              <div className="text-green-500/80 font-mono text-xs flex items-center mt-1">
                <span className="text-green-500/50 mr-1">ID:</span>
                <span>{formatAddress(token.id)}</span>
                <button
                  onClick={() =>
                    router.push(route('address', { id: token.id }))
                  }
                  className="ml-1 text-[10px] text-green-400 hover:text-green-300 transition-colors"
                >
                  [view]
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1">
              {token.compressed && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded-full">
                  Compressed
                </span>
              )}
              {token.mutable && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded-full">
                  Mutable
                </span>
              )}
            </div>
          </div>

          <div className="text-green-500/80 font-mono text-xs mt-1.5 flex items-center">
            <span className="text-green-500/50 mr-1">Creator:</span>
            <span>{creator}</span>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div
      className={`border border-green-800/30 rounded-md overflow-hidden hover:bg-green-900/10 transition-all duration-300 relative group ${
        isHovered
          ? 'bg-green-900/20 border-green-500/30 shadow-lg shadow-green-900/10 transform scale-[1.02]'
          : ''
      }`}
      onMouseEnter={() => onHover?.(token.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Badges */}
      <div className="absolute top-2 right-2 flex space-x-1 z-10">
        {token.compressed && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-green-900/80 text-green-300 rounded-full backdrop-blur-sm">
            Compressed
          </span>
        )}
        {token.mutable && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-green-900/80 text-green-300 rounded-full backdrop-blur-sm">
            Mutable
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative w-full aspect-square bg-black/20 overflow-hidden">
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse w-full h-full bg-gradient-to-br from-green-900/20 to-green-800/10" />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
            onClick={() => onImageClick(imageUrl, name)}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-green-500/50 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Token Info */}
      <div className="p-3 space-y-2 bg-black/40 backdrop-blur-sm">
        <div className="font-mono text-sm truncate font-semibold text-green-300 group-hover:text-green-200 transition-colors">
          {name}
        </div>

        <div className="text-[11px] space-y-1.5">
          <div className="text-green-500/80 font-mono flex items-center">
            <span className="text-green-500/50 mr-1">NFT:</span>
            <span className="text-green-400">{formatAddress(token.id)}</span>
            <button
              onClick={() => router.push(route('address', { id: token.id }))}
              className="ml-1 text-[10px] text-green-400 hover:text-green-300 transition-colors"
            >
              [view]
            </button>
          </div>

          <div className="text-green-500/80 font-mono flex items-center">
            <span className="text-green-500/50 mr-1">Creator:</span>
            <span className="text-green-400">→ {creator}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const NFTGrid = ({
  tokens,
  onImageClick,
  viewMode = 'grid',
  onHover,
  hoveredNFT,
  hideErroredImages = false,
}: NFTGridProps) => {
  // Sort tokens: prioritize tokens with images
  const sortedTokens = [...tokens].sort((a, b) => {
    const aHasImage = a.imageUrl
    const bHasImage = b.imageUrl
    if (aHasImage && !bHasImage) return -1
    if (!aHasImage && bHasImage) return 1
    return 0
  })

  // Container styles based on view mode
  const containerClass =
    viewMode === 'list'
      ? 'space-y-2 p-3'
      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4'

  return (
    <div className={containerClass}>
      {sortedTokens.map((token) => (
        <NFTCard
          key={token.id}
          token={token}
          onImageClick={onImageClick}
          onHover={onHover}
          isHovered={hoveredNFT === token.id}
          viewMode={viewMode}
          hideErroredImages={hideErroredImages}
        />
      ))}
    </div>
  )
}
