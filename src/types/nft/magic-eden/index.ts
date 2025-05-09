// Local types and hooks

import { NFTTokenInfo } from '@/types/Token'

export interface CollectionListItem {
  pdaAddress: string
  auctionHouse: string
  tokenAddress: string
  tokenMint: string
  seller: string
  sellerReferral: string
  tokenSize: number
  price: number
  priceInfo: {
    solPrice: {
      rawAmount: string
      address: string
      decimals: number
    }
  }
  rarity: any
  extra: {
    img: string
  }
  expiry: number
  token: {
    mintAddress: string
    owner: string
    supply: number
    collection: string
    collectionName: string
    name: string
    updateAuthority: string
    primarySaleHappened: boolean
    sellerFeeBasisPoints: number
    image: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
    properties: {
      files: Array<{
        uri: string
      }>
    }
    isCompressed: boolean
    price: number
    listStatus: string
    tokenAddress: string
    priceInfo: {
      solPrice: {
        rawAmount: string
        address: string
        decimals: number
      }
    }
  }
  listingSource: string
}

export interface CollectionStat {
  symbol?: string
  floorPrice: number
  listedCount: number
  volume24hr: number
  avgPrice24hr?: number
  txns24hr: number
  volumeAll: number
  supply: number
  holders: number
}

export interface NftCollectionDetailProps {
  id: string
  tokenInfo: NFTTokenInfo
}

export interface MagicEdenNFT {
  // Core identifiers
  mintAddress: string
  name: string

  // Ownership & Control
  owner: string
  updateAuthority: string
  primarySaleHappened: boolean
  sellerFeeBasisPoints: number

  // Classification
  supply: number
  collection: string
  collectionName: string
  isCompressed: boolean

  // Media
  image: string

  // Attributes & Properties
  attributes: Array<{
    trait_type: string
    value: string
  }>
  properties: {
    files: Array<{
      uri: string
    }>
    // Optional fields that might be present
    creators?: Array<{
      address: string
      share?: number
    }>
    edition?: number
  }

  // Marketplace data
  price?: number
  listStatus?: string
  tokenAddress?: string
  priceInfo?: {
    solPrice: {
      rawAmount: string
      address: string
      decimals: number
    }
  }

  // Additional metadata that might be present
  description?: string
  externalUrl?: string
  animationUrl?: string
  category?: string
}
