import type { CollectionListItem, MagicEdenNFT } from '@/types/nft/magic-eden'
import type { NFT, NFTSupply } from '@/utils/types'

/**
 * Converts a Magic Eden CollectionListItem to the application's NFT type
 *
 * @param item The Magic Eden CollectionListItem to convert
 * @returns An NFT object with data mapped from the CollectionListItem
 */
export function magicEdenNFTToNFT(item: MagicEdenNFT): NFT {
  // Determine the NFT interface type - defaulting to V1_NFT if unknown
  const nftInterface = 'V1_NFT'
  // Get the image URL from the image property
  const imageUrl = item.image ?? null

  // Extract creators if available in the properties
  const creators: string[] = []
  if (item.properties?.files && 'creators' in item.properties) {
    const creatorsProp = (item.properties as any).creators
    if (Array.isArray(creatorsProp)) {
      creatorsProp.forEach((creator) => {
        if (creator && typeof creator === 'object' && 'address' in creator) {
          creators.push(creator.address)
        }
      })
    }
  }

  // Create supply object if edition information is available
  let supply: NFTSupply | undefined
  if (item.properties?.files && 'edition' in item.properties) {
    const edition = (item.properties as any).edition
    if (typeof edition === 'number') {
      supply = {
        printMaxSupply: item.supply || 0,
        printCurrentSupply: item.supply || 0,
        editionNonce: 0,
        editionNumber: edition,
      }
    }
  }

  // Get external URL if available
  const externalUrl =
    'externalUrl' in item ? (item as any).externalUrl : undefined

  return {
    // Core identifiers
    id: item.mintAddress,
    mint: item.mintAddress,
    name: item.name,
    symbol: item.collection || '', // MagicEdenNFT doesn't have a symbol field
    owner: item.owner,
    // Classification
    interface: nftInterface,
    compressed: item.isCompressed ?? false,

    // Ownership & Control
    authorities: [item.updateAuthority].filter(Boolean),
    creators: creators,
    mutable: false, // Assuming mutable by default
    burnt: false, // Assuming not burnt by default

    // Media
    imageUrl: imageUrl,

    // Metadata
    metadata: {
      name: item.name,
      symbol: item.collection || '',
      description: '', // Using empty string as MagicEdenNFT doesn't have a description field
      attributes: item.attributes || [],
      image: imageUrl,
      collection: item.collectionName
        ? {
            name: item.collectionName,
            family: item.collection,
            verified: false, // Assuming not verified by default
          }
        : undefined,
    },

    // External links
    links: {
      image: imageUrl,
      external_url: externalUrl,
    },

    // Supply information if available
    ...(supply && { supply }),

    // Price information if available
    ...(item.price && {
      price: {
        amount: item.price,
        currency: 'SOL',
      },
    }),

    // Marketplace data if available
    ...(item.listStatus && {
      marketplace: {
        listed: item.listStatus === 'listed',
        source: 'Magic Eden',
      },
    }),
  }
}

/**
 * Converts a Magic Eden CollectionListItem to the application's NFT type
 *
 * @param item The Magic Eden CollectionListItem to convert
 * @returns An NFT object with data mapped from the CollectionListItem
 */
export function collectionListItemToNFT(item: CollectionListItem): NFT {
  // Determine the NFT interface type - defaulting to V1_NFT if unknown
  const nftInterface = item.token.isCompressed ? 'V2_NFT' : 'V1_NFT'

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
    mutable: false, // Assuming mutable by default
    burnt: false, // Assuming not burnt by default
    owner: item.token.owner,

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

    // Price information if available
    ...(item.price && {
      price: {
        amount: item.price,
        currency: 'SOL',
      },
    }),

    // Marketplace data
    marketplace: {
      listed: true, // CollectionListItem represents a listed item
      source: item.listingSource || 'Magic Eden',
    },

    // Supply is optional in NFT type, so we're not including it
  }
}
