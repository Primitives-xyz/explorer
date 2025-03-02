import { DAS } from 'helius-sdk/dist/src/types/das-types'
import Image from 'next/image'
import { useNFTImage } from '../hooks/use-nft-image'

interface NFTDetailViewProps {
  nft: DAS.GetAssetResponse & {
    isSpam?: boolean
    spamReasons?: string[]
    hasValidImage?: boolean | null
  }
  onClose?: () => void
}

export default function NFTDetailView({ nft, onClose }: NFTDetailViewProps) {
  const {
    url: imageUrl,
    isLoading: imageLoading,
    error: imageError,
  } = useNFTImage(nft.content)

  // Extract NFT metadata
  const name = nft.content?.metadata?.name || 'Unnamed NFT'
  const symbol = nft.content?.metadata?.symbol || ''
  const description = nft.content?.metadata?.description || 'No description'
  const attributes = nft.content?.metadata?.attributes || []

  // Collection information
  const collection = nft.grouping?.find((g) => g.group_key === 'collection')
  const collectionName =
    collection?.collection_metadata?.name ||
    collection?.group_value ||
    'Uncategorized'
  const isVerified = collection?.verified || false

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">{name}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden border">
            {imageLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image available</span>
              </div>
            )}

            {nft.isSpam && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                Spam Detected
              </div>
            )}
          </div>

          {nft.isSpam && nft.spamReasons && nft.spamReasons.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">
                Spam Detection Reasons:
              </h3>
              <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                {nft.spamReasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Collection</h3>
            <div className="flex items-center space-x-2">
              <span>{collectionName}</span>
              {isVerified && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Symbol</span>
                <span>{symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mint</span>
                <span className="text-sm truncate max-w-[200px]">{nft.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Owner</span>
                <span className="text-sm truncate max-w-[200px]">
                  {nft.ownership?.owner}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-gray-700">{description}</p>
          </div>

          {attributes.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Attributes</h3>
              <div className="grid grid-cols-2 gap-2">
                {attributes.map((attr, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md bg-gray-50 border ${
                      nft.spamReasons?.some((reason) =>
                        reason.includes(attr.trait_type)
                      )
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="text-xs text-gray-500">
                      {attr.trait_type}
                    </div>
                    <div className="font-medium truncate">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Technical Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Interface</span>
                <span>{nft.interface}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compressed</span>
                <span>{nft.compression?.compressed ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Image Status</span>
                <span>
                  {nft.hasValidImage === true
                    ? 'Valid'
                    : nft.hasValidImage === false
                    ? 'Invalid'
                    : 'Not Validated'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
