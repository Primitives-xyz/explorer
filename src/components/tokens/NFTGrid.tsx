import { NFT, TokenWithInscription } from '@/utils/types'

interface NFTGridProps {
  nfts: (NFT | TokenWithInscription)[]
  onImageClick: (url: string, symbol: string) => void
}

export const NFTGrid = ({ nfts, onImageClick }: NFTGridProps) => {
  const isInscription = (
    nft: NFT | TokenWithInscription,
  ): nft is TokenWithInscription => {
    return 'inscription' in nft
  }

  const isNFT = (nft: NFT | TokenWithInscription): nft is NFT => {
    return 'supply' in nft
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {nfts.map((nft) => {
        const imageUrl = nft.imageUrl
        const name = nft.name || 'Unnamed NFT'
        const symbol = nft.symbol || ''
        const creators =
          nft.creators.length > 0
            ? nft.creators.slice(0, 2).join(', ') +
              (nft.creators.length > 2 ? '...' : '')
            : 'Unknown Creator'

        return (
          <div
            key={nft.id}
            className="border border-green-800/30 rounded-lg p-3 hover:bg-green-900/10 transition-colors relative group"
          >
            {/* Compressed Badge */}
            {nft.compressed && (
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

            {/* NFT Info */}
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

              {/* Supply Info */}
              {isNFT(nft) && nft.supply && (
                <div className="text-green-600/80 font-mono text-xs">
                  Edition: {nft.supply.editionNumber} /{' '}
                  {nft.supply.printMaxSupply || '∞'}
                </div>
              )}

              {/* Inscription Info */}
              {isInscription(nft) && (
                <div className="mt-2 p-1.5 bg-green-900/20 rounded-md">
                  <div className="text-green-500 font-mono text-xs">
                    Inscription #{nft.inscription.order}
                  </div>
                  <div className="text-green-600/80 font-mono text-xs truncate">
                    {nft.inscription.contentType}
                  </div>
                </div>
              )}

              {/* Attributes */}
              <div className="flex flex-wrap gap-1 mt-2">
                {nft.mutable && (
                  <span className="text-xs font-mono px-1.5 py-0.5 bg-green-900/20 text-green-500 rounded">
                    Mutable
                  </span>
                )}
                {nft.burnt && (
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
