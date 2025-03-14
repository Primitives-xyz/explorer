import type { CollectionListItem } from '@/types/nft/magic-eden'
import type { NFT } from '@/utils/types'

/**
 * Converts a Magic Eden CollectionListItem to the application's NFT type
 *
 * @param item The Magic Eden CollectionListItem to convert
 * @returns An NFT object with data mapped from the CollectionListItem
 */
export function collectionListItemToNFT(item: CollectionListItem): NFT {
  // Determine the NFT interface type - defaulting to V1_NFT if unknown
  const nftInterface = item.token.isCompressed ? 'V2_NFT' : 'V1_NFT'
  console.log({ item })

  // Get the image URL from either token.image or extra.img
  const imageUrl = item.token.image ?? item.extra.img ?? null

  return {
    // Base token properties
    id: item.tokenMint, // Using tokenMint as the unique identifier
    interface: nftInterface,
    name: item.token.name,
    symbol: '', // CollectionListItem doesn't seem to have a symbol field
    imageUrl: imageUrl,
    mint: item.tokenMint,
    compressed: item.token.isCompressed,
    authorities: [item.token.updateAuthority].filter(Boolean), // Add updateAuthority as an authority
    creators: [], // CollectionListItem doesn't have detailed creator info
    mutable: true, // Assuming mutable by default
    burnt: false, // Assuming not burnt by default

    // Metadata
    metadata: {
      name: item.token.name,
      symbol: '', // CollectionListItem doesn't seem to have a symbol field
      description: '', // CollectionListItem doesn't have a description field
      attributes: item.token.attributes || [],
      image: imageUrl,
      collection: item.token.collectionName
        ? {
            name: item.token.collectionName,
            family: item.token.collection,
            verified: false, // Assuming not verified by default
          }
        : undefined,
    },

    // Links
    links: {
      image: imageUrl,
    },

    // Supply is optional in NFT type, so we're not including it
  }
}
