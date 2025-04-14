import { DAS } from 'helius-sdk/dist/src/types/das-types'
import {
  AssetSortBy,
  AssetSortDirection,
} from 'helius-sdk/dist/src/types/enums'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParseNFTData } from './use-parse-nft-data'

// Define the collection group type
interface CollectionGroup {
  collectionId: string
  collectionName: string
  collectionImage?: string
  items: DAS.GetAssetResponse[]
  verified: boolean
  itemCount: number
  spamProbability: number
}

// Define NFT with additional metadata
interface EnhancedNFT extends DAS.GetAssetResponse {
  isSpam: boolean
  hasValidImage: boolean | null
  spamReasons: string[]
}

// Define spam filter criteria
interface SpamFilterCriteria {
  nameKeywords: string[]
  attributeKeywords: Record<string, string[]>
  suspiciousCollectionSizes: {
    min: number
    max: number
  }
  enabled: boolean
}

interface UseGroupedNFTDataResult {
  collections: CollectionGroup[]
  enhancedNFTs: EnhancedNFT[]
  loading: boolean
  error: string | undefined
  refetch: () => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
  totalCount: number
  filteredCount: number
  spamCount: number
  spamFilterEnabled: boolean
  toggleSpamFilter: () => void
  updateSpamFilterCriteria: (criteria: Partial<SpamFilterCriteria>) => void
  spamFilterCriteria: SpamFilterCriteria
}

/**
 * Custom hook for fetching NFT data grouped by collection with spam filtering
 * @param address The wallet address to fetch NFTs for
 * @param showFungible Whether to include fungible tokens. Defaults to false.
 * @param showNativeBalance Whether to include native SOL balance. Defaults to false.
 * @param pageSize Number of items to fetch per page. Defaults to 100.
 * @param validateImages Whether to validate image URLs. Defaults to false.
 */
export function useGroupedNFTData(
  address: string,
  showFungible = false,
  showNativeBalance = false,
  pageSize = 100
): UseGroupedNFTDataResult {
  // Default spam filter criteria
  const defaultSpamFilterCriteria: SpamFilterCriteria = {
    nameKeywords: [
      'refund',
      'airdrop',
      'bounty',
      'spam',
      'claim',
      'reward',
      'free',
      'giveaway',
    ],
    attributeKeywords: {
      DURATION: ['*'],
      ELIGIBLE: ['*'],
      ELIGIBILITY: ['*'],
      EXPIRY: ['*'],
      CLAIM: ['*'],
    },
    suspiciousCollectionSizes: {
      min: 1,
      max: 3,
    },
    enabled: true,
  }

  // State for spam filter
  const [spamFilterCriteria, setSpamFilterCriteria] =
    useState<SpamFilterCriteria>(defaultSpamFilterCriteria)
  const [spamFilterEnabled, setSpamFilterEnabled] = useState(true)
  const [enhancedNFTs, setEnhancedNFTs] = useState<EnhancedNFT[]>([])
  const t = useTranslations()

  // Use the existing NFT data hook
  const { nfts, loading, error, refetch, loadMore, hasMore, totalCount } =
    useParseNFTData(
      address,
      showFungible,
      showNativeBalance,
      true, // Always show collection metadata
      pageSize,
      AssetSortBy.RecentAction,
      AssetSortDirection.Desc
    )

  // Function to check if an NFT is spam based on criteria
  const checkSpamStatus = useCallback(
    (
      nft: DAS.GetAssetResponse,
      collectionSize: number
    ): { isSpam: boolean; reasons: string[] } => {
      if (!spamFilterEnabled) return { isSpam: false, reasons: [] }

      const reasons: string[] = []

      // Get NFT name and collection info for debugging
      const name = nft.content?.metadata?.name || ''
      let collectionName = 'Uncategorized'
      let collectionId = 'uncategorized'

      if (nft.grouping && nft.grouping.length > 0) {
        const collection = nft.grouping.find(
          (g) => g.group_key === 'collection'
        )
        if (collection) {
          collectionId = collection.group_value
          collectionName = collection.collection_metadata?.name || collectionId
        }
      }

      // Special case for ai16z partners collection - whitelist it
      if (
        collectionId === 'EdnvVJ9JjfAaokr9MGKsSHK4aoUYn8RiYF2t2HSsKVR2' ||
        collectionName.includes('ai16z partners') ||
        name.includes('ai16z partner')
      ) {
        console.log('Whitelisting ai16z partners NFT:', {
          id: nft.id,
          name,
          collectionId,
          collectionName,
        })
        return { isSpam: false, reasons: [] }
      }

      // Check name for spam keywords
      const nameLower = name.toLowerCase()
      for (const keyword of spamFilterCriteria.nameKeywords) {
        if (nameLower.includes(keyword.toLowerCase())) {
          reasons.push(`Name contains "${keyword}"`)
          break
        }
      }

      // Check attributes for spam keywords
      const attributes = nft.content?.metadata?.attributes || []
      for (const attr of attributes) {
        const traitType = attr.trait_type.toUpperCase()
        const value = String(attr.value).toLowerCase()

        // Check if this trait type is in our spam criteria
        if (spamFilterCriteria.attributeKeywords[traitType]) {
          const keywordsForTrait =
            spamFilterCriteria.attributeKeywords[traitType]

          // If the criteria includes '*', any value for this trait is considered spam
          if (keywordsForTrait.includes('*')) {
            reasons.push(`Contains suspicious attribute "${traitType}"`)
            break
          }

          // Otherwise check if the value matches any of the keywords
          for (const keyword of keywordsForTrait) {
            if (value.includes(keyword.toLowerCase())) {
              reasons.push(`Attribute "${traitType}" contains "${keyword}"`)
              break
            }
          }
        }
      }

      // Check collection size
      const { min, max } = spamFilterCriteria.suspiciousCollectionSizes
      if (collectionSize >= min && collectionSize <= max) {
        reasons.push(`Small collection size (${collectionSize} items)`)
      }

      return {
        isSpam: reasons.length > 0,
        reasons,
      }
    },
    [spamFilterEnabled, spamFilterCriteria]
  )

  // Check if an NFT has a valid image structure
  const hasValidImageStructure = useCallback(
    (nft: DAS.GetAssetResponse): boolean => {
      // Check if there's a direct image link
      if (nft.content?.links?.image) {
        return true
      }

      // Check if there's a CDN URI or URI in files
      if (nft.content?.files && nft.content.files.length > 0) {
        if (nft.content.files[0].cdn_uri || nft.content.files[0].uri) {
          return true
        }
      }

      // Check if there's a json_uri that might contain an image
      if (nft.content?.json_uri) {
        return true
      }

      return false
    },
    []
  )

  // Extract image URL from NFT
  const extractImageUrl = useCallback(
    (nft: DAS.GetAssetResponse): string | null => {
      if (nft.content?.links?.image) {
        return nft.content.links.image
      }

      if (nft.content?.files && nft.content.files.length > 0) {
        if (nft.content.files[0].cdn_uri) {
          return nft.content.files[0].cdn_uri
        }
        if (nft.content.files[0].uri) {
          return nft.content.files[0].uri
        }
      }

      if (
        nft.content?.json_uri &&
        nft.content.json_uri.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      ) {
        return nft.content.json_uri
      }

      return null
    },
    []
  )

  // Process NFTs to add spam detection and image validation
  useEffect(() => {
    // First, group NFTs by collection to get collection sizes
    const collectionSizes = new Map<string, number>()

    nfts.forEach((nft) => {
      let collectionId = 'uncategorized'

      // Try to get collection info from grouping
      if (nft.grouping && nft.grouping.length > 0) {
        const collection = nft.grouping.find(
          (g) => g.group_key === 'collection'
        )
        if (collection) {
          collectionId = collection.group_value
        }
      }

      // Count items in each collection
      collectionSizes.set(
        collectionId,
        (collectionSizes.get(collectionId) || 0) + 1
      )
    })

    // Debug log collection sizes
    // console.log('Collection sizes:', Object.fromEntries(collectionSizes))

    // Then process each NFT with the collection size information
    const processed = nfts.map((nft) => {
      let collectionId = 'uncategorized'
      let collectionName = 'Uncategorized'

      // Get collection ID
      if (nft.grouping && nft.grouping.length > 0) {
        const collection = nft.grouping.find(
          (g) => g.group_key === 'collection'
        )
        if (collection) {
          collectionId = collection.group_value
          collectionName = collection.collection_metadata?.name || collectionId
        }
      }

      const collectionSize = collectionSizes.get(collectionId) || 0

      // Debug log for specific NFTs of interest
      if (
        nft.content?.metadata?.name?.includes('ai16z partner') ||
        collectionName?.includes('ai16z partners')
      ) {
        console.log('Found ai16z partner NFT:', {
          id: nft.id,
          name: nft.content?.metadata?.name,
          collectionId,
          collectionName,
          collectionSize,
        })
      }

      const { isSpam, reasons } = checkSpamStatus(nft, collectionSize)
      const hasValidImage = hasValidImageStructure(nft)

      // Debug log for spam status of specific NFTs
      if (
        nft.content?.metadata?.name?.includes('ai16z partner') ||
        collectionName?.includes('ai16z partners')
      ) {
        console.log('Spam status for ai16z partner NFT:', {
          id: nft.id,
          name: nft.content?.metadata?.name,
          isSpam,
          reasons,
        })
      }

      return {
        ...nft,
        isSpam,
        hasValidImage: hasValidImage ? null : false, // null means structure is valid but not validated
        spamReasons: reasons,
      }
    })

    setEnhancedNFTs(processed)
  }, [nfts, checkSpamStatus, hasValidImageStructure])

  // Group NFTs by collection and filter out spam
  const { collections, filteredCount, spamCount } = useMemo(() => {
    const collectionMap = new Map<string, CollectionGroup>()
    let filteredCount = 0
    let spamCount = 0

    enhancedNFTs.forEach((nft) => {
      // Count spam NFTs
      if (nft.isSpam) {
        spamCount++
        if (spamFilterEnabled) {
          return // Skip this NFT if it's spam and filter is enabled
        }
      }

      // Find the collection ID and name
      let collectionId = 'uncategorized'
      let collectionName = 'Uncategorized'
      let collectionImage = undefined
      let verified = false

      // Try to get collection info from grouping
      if (nft.grouping && nft.grouping.length > 0) {
        const collection = nft.grouping.find(
          (g) => g.group_key === 'collection'
        )
        if (collection) {
          collectionId = collection.group_value
          collectionName = collection.collection_metadata?.name || collectionId
          collectionImage = collection.collection_metadata?.image
          verified = collection.verified || false
        }
      }

      // Create or update the collection group
      if (!collectionMap.has(collectionId)) {
        collectionMap.set(collectionId, {
          collectionId,
          collectionName,
          collectionImage,
          items: [],
          verified,
          itemCount: 0,
          spamProbability: 0,
        })
      }

      // Add the NFT to its collection group
      const collection = collectionMap.get(collectionId)!
      collection.items.push(nft)
      collection.itemCount++
      filteredCount++
    })

    // Calculate spam probability for each collection
    collectionMap.forEach((collection) => {
      const spamItems = collection.items.filter(
        (nft) => (nft as EnhancedNFT).isSpam
      ).length
      collection.spamProbability = spamItems / collection.items.length
    })

    // Convert the map to an array and sort collections by size (descending)
    const collectionsArray = Array.from(collectionMap.values()).sort((a, b) => {
      // First sort by verified status
      if (a.verified !== b.verified) {
        return a.verified ? -1 : 1
      }
      // Then by spam probability (ascending)
      if (a.spamProbability !== b.spamProbability) {
        return a.spamProbability - b.spamProbability
      }
      // Finally by size (descending)
      return b.items.length - a.items.length
    })

    return {
      collections: collectionsArray,
      filteredCount,
      spamCount,
    }
  }, [enhancedNFTs, spamFilterEnabled])

  // Toggle spam filter
  const toggleSpamFilter = () => {
    setSpamFilterEnabled((prev) => !prev)
  }

  // Update spam filter criteria
  const updateSpamFilterCriteria = (criteria: Partial<SpamFilterCriteria>) => {
    setSpamFilterCriteria((prev) => ({
      ...prev,
      ...criteria,
    }))
  }

  return {
    collections,
    enhancedNFTs,
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    totalCount,
    filteredCount,
    spamCount,
    spamFilterEnabled,
    toggleSpamFilter,
    updateSpamFilterCriteria,
    spamFilterCriteria,
  }
}
