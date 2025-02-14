import { useNFTImage } from '@/hooks/use-nft-image'
import { route } from '@/utils/routes'
import type { FungibleToken, NFT, TokenWithInscription } from '@/utils/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TokenAddress } from './token-address'

interface NFTGridProps {
  tokens: (NFT | TokenWithInscription | FungibleToken)[]
  onImageClick: (url: string, symbol: string) => void
  onAddressSearch?: (address: string) => void
}

interface NFTImageContainerProps {
  token: NFT | TokenWithInscription | FungibleToken
  name: string
  onImageClick: (url: string, symbol: string) => void
  onImageError: () => void
}

const NFTImageContainer = ({
  token,
  name,
  onImageClick,
  onImageError,
}: NFTImageContainerProps) => {
  const { url: imageUrl, isLoading: imageLoading } = useNFTImage(token.content)

  return (
    <div className="relative aspect-square w-full mb-4 bg-black/20 rounded-lg overflow-hidden">
      {imageLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-gradient-to-br from-green-900/40 to-green-800/20" />
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
          onClick={() => onImageClick(imageUrl, name)}
          onError={onImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center /50 text-lg">
          No Image
        </div>
      )}
    </div>
  )
}

export const NFTGrid = ({ tokens, onImageClick }: NFTGridProps) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const router = useRouter()

  const isInscription = (
    token: NFT | TokenWithInscription | FungibleToken
  ): token is TokenWithInscription => {
    return 'inscription' in token
  }

  const isNFT = (
    token: NFT | TokenWithInscription | FungibleToken
  ): token is NFT => {
    return 'supply' in token && !('balance' in token)
  }

  const isFungible = (
    token: NFT | TokenWithInscription | FungibleToken
  ): token is FungibleToken => {
    return 'balance' in token
  }

  const formatCreators = (creators: any[]) => {
    if (!creators || creators.length === 0) return 'Unknown Creator'
    const displayedCreators = creators.slice(0, 2).map((creator, index) => {
      const address = creator.address || creator
      return (
        <span key={address} className="inline-flex items-center gap-1">
          <TokenAddress address={address} />
          {index < Math.min(creators.length, 2) - 1 && ', '}
        </span>
      )
    })

    return (
      <>
        {displayedCreators}
        {creators.length > 2 && '...'}
      </>
    )
  }

  const handleImageError = (tokenId: string) => {
    setFailedImages((prev) => new Set(prev).add(tokenId))
  }

  const hasValidImage = (token: NFT | TokenWithInscription | FungibleToken) => {
    return token.imageUrl && !failedImages.has(token.id)
  }

  // Sort tokens: items with valid images first
  const sortedTokens = [...tokens].sort((a, b) => {
    const aHasImage = hasValidImage(a)
    const bHasImage = hasValidImage(b)
    if (aHasImage && !bHasImage) return -1
    if (!aHasImage && bHasImage) return 1
    return 0
  })

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-3">
      {sortedTokens.map((token) => {
        const name = token.name || 'Unnamed Token'
        const symbol = token.symbol || ''
        const creators = token.creators || []

        return (
          <div
            key={token.id}
            className="border border-green-800/30 rounded-lg p-3 hover:bg-green-900/10 transition-colors relative group"
          >
            {/* Compressed Badge */}
            {token.compressed && (
              <div className="absolute top-3 right-3 bg-green-900/80  text-xs px-2 py-1 rounded-full z-10">
                Compressed
              </div>
            )}

            {/* Image Container */}
            <NFTImageContainer
              token={token}
              name={name}
              onImageClick={onImageClick}
              onImageError={() => handleImageError(token.id)}
            />

            {/* Token Info */}
            <div className="space-y-2">
              <button
                onClick={() => router.push(route('address', { id: token.id }))}
                className=" font-mono text-base truncate font-semibold group-hover: transition-colors w-full text-left hover:"
              >
                {name}
              </button>
              {symbol && (
                <button
                  onClick={() =>
                    router.push(route('address', { id: token.id }))
                  }
                  className=" font-mono text-sm group-hover: transition-colors w-full text-left hover:"
                >
                  {symbol}
                </button>
              )}
              <div className="/80 font-mono text-xs flex items-center gap-1">
                <span className="/50">NFT:</span>
                <TokenAddress address={token.id} />
              </div>
              <div className="/80 font-mono text-xs group-hover:/80 transition-colors">
                <span className="/50">Creator:</span> {formatCreators(creators)}
              </div>

              {/* Supply Info for NFTs */}
              {isNFT(token) && token.supply && token.supply.editionNumber && (
                <div className="/80 font-mono text-xs group-hover:/80 transition-colors">
                  Edition: {token.supply.editionNumber}
                  {token.supply.printMaxSupply
                    ? ` / ${token.supply.printMaxSupply}`
                    : ''}
                </div>
              )}

              {/* Balance Info for Fungible Tokens */}
              {isFungible(token) && (
                <div className="/80 font-mono text-xs group-hover:/80 transition-colors">
                  Balance: {token.balance.toLocaleString()}
                  {token.price > 0 && (
                    <div className=" group-hover: transition-colors">
                      ≈ $
                      {(token.price * token.balance).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Inscription Info */}
              {isInscription(token) && (
                <div className="mt-2 p-1.5 bg-green-900/20 rounded-md group-hover:bg-green-900/30 transition-colors">
                  <div className=" font-mono text-xs group-hover: transition-colors">
                    Inscription #{token.inscription.order}
                  </div>
                  <div className="/80 font-mono text-xs truncate group-hover:/80 transition-colors">
                    {token.inscription.contentType}
                  </div>
                </div>
              )}

              {/* Attributes */}
              <div className="flex flex-wrap gap-1 mt-2">
                {token.mutable && (
                  <span className="text-xs font-mono px-1.5 py-0.5 bg-green-900/20  rounded group-hover:bg-green-900/30 group-hover: transition-colors">
                    Mutable
                  </span>
                )}
                {token.burnt && (
                  <span className="text-xs font-mono px-1.5 py-0.5 bg-red-900/20 text-red-500 rounded group-hover:bg-red-900/30 group-hover:text-red-400 transition-colors">
                    Burnt
                  </span>
                )}
                {token.compressed && (
                  <span className="text-xs font-mono px-1.5 py-0.5 bg-green-900/20  rounded group-hover:bg-green-900/30 group-hover: transition-colors">
                    Compressed
                  </span>
                )}
                {isFungible(token) && token.associatedTokenAddress && (
                  <div className="text-xs font-mono px-1.5 py-0.5 bg-green-900/20  rounded group-hover:bg-green-900/30 group-hover: transition-colors">
                    ATA: <TokenAddress address={token.associatedTokenAddress} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
