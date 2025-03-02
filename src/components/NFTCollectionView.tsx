import { DAS } from 'helius-sdk/dist/src/types/das-types'
import Image from 'next/image'
import { useState } from 'react'
import { useGroupedNFTData } from '../hooks/use-grouped-nft-data'
import NFTDetailView from './NFTDetailView'

interface NFTCollectionViewProps {
  walletAddress: string
}

export default function NFTCollectionView({
  walletAddress,
}: NFTCollectionViewProps) {
  const [showSpam, setShowSpam] = useState(false)
  const [showAllNFTs, setShowAllNFTs] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<
    | (DAS.GetAssetResponse & {
        isSpam?: boolean
        spamReasons?: string[]
        hasValidImage?: boolean | null
      })
    | null
  >(null)

  const {
    collections,
    enhancedNFTs,
    isLoading,
    error,
    loadMore,
    hasMore,
    totalCount,
    filteredCount,
    spamCount,
    spamFilterEnabled,
    toggleSpamFilter,
    spamFilterCriteria,
  } = useGroupedNFTData(walletAddress)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <h3 className="font-bold">Error loading NFTs</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          NFT Collections ({filteredCount} of {totalCount})
        </h2>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="spam-filter"
              checked={spamFilterEnabled}
              onChange={toggleSpamFilter}
              className="mr-2 h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="spam-filter">
              Filter Spam ({spamCount} hidden)
            </label>
          </div>

          <button
            onClick={() => setShowSpam(!showSpam)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          >
            {showSpam ? 'Hide Spam Details' : 'Show Spam Details'}
          </button>

          <button
            onClick={() => setShowAllNFTs(!showAllNFTs)}
            className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-sm"
          >
            {showAllNFTs ? 'Hide All NFTs' : 'Debug: Show All NFTs'}
          </button>
        </div>
      </div>

      {showSpam && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Spam Filter Criteria</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm">Name Keywords</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {spamFilterCriteria.nameKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-gray-200 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm">Suspicious Attributes</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(spamFilterCriteria.attributeKeywords).map(
                  ([key]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-gray-200 text-xs rounded"
                    >
                      {key}
                    </span>
                  )
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm">Collection Size Filter</h4>
              <div className="mt-1">
                <span className="px-2 py-1 bg-gray-200 text-xs rounded">
                  Min: {spamFilterCriteria.suspiciousCollectionSizes.min}
                </span>
                <span className="px-2 py-1 bg-gray-200 text-xs rounded ml-2">
                  Max: {spamFilterCriteria.suspiciousCollectionSizes.max}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug section to show all NFTs including spam */}
      {showAllNFTs && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">
            Debug: All NFTs (Including Spam)
          </h3>
          <div className="overflow-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spam Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reasons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enhancedNFTs.map((nft) => {
                  // Find collection info
                  let collectionName = 'Uncategorized'
                  if (nft.grouping && nft.grouping.length > 0) {
                    const collection = nft.grouping.find(
                      (g) => g.group_key === 'collection'
                    )
                    if (collection && collection.collection_metadata?.name) {
                      collectionName = collection.collection_metadata.name
                    }
                  }

                  return (
                    <tr
                      key={nft.id}
                      className={nft.isSpam ? 'bg-yellow-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {nft.content?.metadata?.name || 'Unnamed NFT'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {collectionName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {nft.isSpam ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Spam
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Not Spam
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {nft.spamReasons && nft.spamReasons.length > 0 ? (
                          <ul className="list-disc pl-4">
                            {nft.spamReasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedNFT(nft)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <div
            key={collection.collectionId}
            className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
              collection.spamProbability > 0.5
                ? 'border-yellow-300'
                : 'border-gray-200'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center space-x-3">
                {collection.collectionImage ? (
                  <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={collection.collectionImage}
                      alt={collection.collectionName}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-500 text-xs">No img</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">
                    {collection.collectionName}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>{collection.items.length} items</span>
                    {collection.verified && (
                      <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                        Verified
                      </span>
                    )}
                    {collection.spamProbability > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                        {Math.round(collection.spamProbability * 100)}% Spam
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {collection.items.slice(0, 3).map((nft) => {
                  const enhancedNft = nft as any
                  const imageUrl =
                    nft.content?.links?.image ||
                    (nft.content?.files && nft.content.files[0]?.cdn_uri) ||
                    (nft.content?.files && nft.content.files[0]?.uri) ||
                    '/placeholder-nft.png'

                  return (
                    <div
                      key={nft.id}
                      className={`relative aspect-square rounded overflow-hidden cursor-pointer ${
                        enhancedNft.isSpam ? 'ring-1 ring-yellow-400' : ''
                      }`}
                      onClick={() => setSelectedNFT(nft as any)}
                    >
                      <Image
                        src={imageUrl}
                        alt={nft.content?.metadata?.name || 'NFT'}
                        fill
                        className="object-cover"
                      />
                      {enhancedNft.isSpam && (
                        <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-800 text-xs px-1 rounded">
                          Spam
                        </div>
                      )}
                    </div>
                  )
                })}
                {collection.items.length > 3 && (
                  <div
                    className="aspect-square rounded bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      // Show the first NFT not already displayed
                      if (collection.items.length > 3) {
                        setSelectedNFT(collection.items[3] as any)
                      }
                    }}
                  >
                    <span className="text-gray-500">
                      +{collection.items.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => loadMore()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Load More
          </button>
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <NFTDetailView
            nft={selectedNFT}
            onClose={() => setSelectedNFT(null)}
          />
        </div>
      )}
    </div>
  )
}
