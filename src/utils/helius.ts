export enum TokenType {
  ALL = 'all',
  FUNGIBLE = 'fungible',
  NFT = 'nft',
}

export interface FungibleToken {
  id: string
  name: string
  symbol: string
  imageUrl: string | null
  balance: number
  price?: number
  currency?: string
}

export interface NFTToken {
  id: string
  interface: string
  content?: {
    metadata?: {
      name?: string
      symbol?: string
      attributes?: Array<{
        trait_type: string
        value: string | number
      }>
    }
    links?: {
      image?: string
    }
  }
}

export interface Transaction {
  description: string
  type: string
  source: string
  fee: number
  feePayer: string
  signature: string
  slot: number
  timestamp: number
  nativeTransfers: {
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }[]
  tokenTransfers: {
    fromUserAccount: string
    toUserAccount: string
    fromTokenAccount: string
    toTokenAccount: string
    tokenAmount: number
    mint: string
  }[]
}
