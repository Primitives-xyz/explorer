import { FungibleToken, NFT, TokenWithInscription } from '@/utils/types'

interface NFTGridProps {
  tokens: (NFT | TokenWithInscription | FungibleToken)[]
  onImageClick: (url: string, symbol: string) => void
}

export const NFTGrid = ({ tokens, onImageClick }: NFTGridProps) => {
  const isInscription = (
    token: NFT | TokenWithInscription | FungibleToken,
  ): token is TokenWithInscription => {
    return 'inscription' in token
  }

  const isNFT = (
    token: NFT | TokenWithInscription | FungibleToken,
  ): token is NFT => {
    return 'supply' in token && !('balance' in token)
  }

  const isFungible = (
    token: NFT | TokenWithInscription | FungibleToken,
  ): token is FungibleToken => {
    return 'balance' in token
  }

  const formatCreators = (creators: any[]) => {
    if (!creators || creators.length === 0) return 'Unknown Creator'
    return (
      creators
        .slice(0, 2)
        .map((creator) => creator.address || creator)
        .join(', ') + (creators.length > 2 ? '...' : '')
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {tokens.map((token) => {
        const imageUrl = token.imageUrl
        const name = token.name || 'Unnamed Token'
        const symbol = token.symbol || ''
        const creators = formatCreators(token.creators || [])

        return (
          <div
            key={token.id}
            className="border border-green-800/30 rounded-lg p-4 hover:bg-green-900/10 transition-colors relative group"
          >
            {/* Compressed Badge */}
            {token.compressed && (
              <div className="absolute top-2 right-2 bg-green-900/80 text-green-300 text-xs px-2 py-1 rounded-full z-10">
                Compressed
              </div>
            )}

            {/* Image Container */}
            <div className="relative aspect-square w-full mb-2 bg-black/20 rounded-md overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
                  onClick={() => onImageClick(imageUrl, name)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-600/50">
                  No Image
                </div>
              )}
            </div>

            {/* Token Info */}
            <div className="space-y-1.5">
              <div className="text-green-400 font-mono text-sm truncate font-semibold">
                {name}
              </div>
              {symbol && (
                <div className="text-green-600 font-mono text-xs">{symbol}</div>
              )}
              <div className="text-green-600/80 font-mono text-xs truncate">
                By: {creators}
              </div>

              {/* Supply Info for NFTs */}
              {isNFT(token) && token.supply && token.supply.editionNumber && (
                <div className="text-green-600/80 font-mono text-xs">
                  Edition: {token.supply.editionNumber}
                  {token.supply.printMaxSupply
                    ? ` / ${token.supply.printMaxSupply}`
                    : ''}
                </div>
              )}

              {/* Balance Info for Fungible Tokens */}
              {isFungible(token) && (
                <div className="text-green-600/80 font-mono text-xs">
                  Balance: {token.balance.toLocaleString()}
                  {token.price > 0 && (
                    <div className="text-green-500">
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
                <div className="mt-2 p-1.5 bg-green-900/20 rounded-md">
                  <div className="text-green-500 font-mono text-xs">
                    Inscription #{token.inscription.order}
                  </div>
                  <div className="text-green-600/80 font-mono text-xs truncate">
                    {token.inscription.contentType}
                  </div>
                </div>
              )}

              {/* Attributes */}
              <div className="flex flex-wrap gap-1 mt-2">
                {token.mutable && (
                  <span className="text-xs font-mono px-1.5 py-0.5 bg-green-900/20 text-green-500 rounded">
                    Mutable
                  </span>
                )}
                {token.burnt && (
                  <span className="text-xs font-mono px-1.5 py-0.5 bg-red-900/20 text-red-500 rounded">
                    Burnt
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
