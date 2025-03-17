// Magic Eden API Response Types

/**
 * Response from the Magic Eden Collection Stats API
 * @see https://docs.magiceden.io/reference/get_collections-symbol-stats
 */
export interface MagicEdenCollectionStatsResponse {
  results: {
    symbol: string
    floorPrice: number
    listedCount: number
    volume24hr: number
    volumeAll: number
    avgPrice24hr?: number
    txns24hr: number
    // Additional fields that might be present
    floorPriceWithFee?: number
    floorPriceWithFeePercentage?: number
    floorPriceWithFeeAmount?: number
  }
}

/**
 * Response from the Magic Eden Holder Stats API
 * @see https://docs.magiceden.io/reference/get_collections-symbol-holder-stats
 */
export interface MagicEdenHolderStatsResponse {
  totalSupply: number
  uniqueHolders: number
  avgHolding: number
  // Additional fields that might be present
  topHolders?: Array<{
    owner: string
    count: number
  }>
}

/**
 * Response from the Magic Eden Collection Attributes API
 * @see https://docs.magiceden.io/reference/get_collections-collectionsymbol-attributes
 */
export interface MagicEdenAttributesResponse {
  attributes: {
    [key: string]: {
      [value: string]: number
    }
  }
}

/**
 * Response from the Magic Eden Collection Activities API
 */
export interface MagicEdenActivitiesResponse {
  activities: Array<{
    signature: string
    type: 'buyNow' | 'list' | 'delist' | 'bid' | 'cancelBid'
    source: string
    tokenMint: string
    collection: string
    slot: number
    blockTime: number
    buyer?: string
    seller?: string
    price?: number
  }>
}

/**
 * Consolidated Collection Stats with data from multiple endpoints
 */
export interface CollectionStats {
  symbol: string
  floorPrice: number
  listedCount: number
  volume24hr: number
  avgPrice24hr: number
  txns24hr: number
  volumeAll: number
  supply: number
  holders: number
  avgHolding: number
  attributes?: {
    [key: string]: {
      [value: string]: number
    }
  }
  // Optional fields that might be added in the future
  floorPriceWithFee?: number
  topHolders?: Array<{
    owner: string
    count: number
  }>
  recentActivities?: Array<{
    type: string
    price?: number
    time: number
  }>
}
