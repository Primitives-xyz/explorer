// Local types and hooks
import type { NFTTokenInfo } from '@/types/Token'
export interface CollectionList {
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
  floorPrice: number
  listedCount: number
  volume24hr: number
  txns24hr: number
  volumeAll: number
  supply: number
  holders: number
}

export interface NftCollectionDetailProps {
  id: string
  tokenInfo: NFTTokenInfo
}
