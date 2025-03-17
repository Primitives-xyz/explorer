import type { DAS } from 'helius-sdk/dist/src/types/das-types'

export interface BaseToken {
  id: string
  interface:
    | 'FungibleToken'
    | 'FungibleAsset'
    | 'V1_NFT'
    | 'V2_NFT'
    | 'ProgrammableNFT'
    | 'LEGACY_NFT'
    | 'MplCoreAsset'
  name: string
  symbol: string
  imageUrl: string | null
  mint: string
  compressed: boolean
  authorities: string[]
  creators: string[]
  mutable: boolean
  burnt: boolean
  content?: DAS.Content
  metadata: {
    name: string
    symbol: string
    description: string
    attributes?: Array<NFTAttribute>
    image?: string
    collection?: NFTCollection
  }
  links?: {
    image?: string
    external_url?: string
  }
}

export interface FungibleToken extends BaseToken {
  interface: 'FungibleToken' | 'FungibleAsset'
  balance: number
  decimals: number
  supply: number
  price: number
  totalPrice: number
  currency: string
  tokenProgram: string
  associatedTokenAddress: string
}

export interface NFTAttribute {
  trait_type: string
  value: string
  display_type?: string
  max_value?: number
  trait_count?: number
  frequency?: number
}

export interface NFTCollection {
  name: string
  family?: string
  verified?: boolean
  description?: string
  image?: string
  external_url?: string
}

export interface NFTSupply {
  printMaxSupply: number
  printCurrentSupply: number
  editionNonce: number
  editionNumber: number
}

export interface NFT extends BaseToken {
  interface:
    | 'V1_NFT'
    | 'V2_NFT'
    | 'ProgrammableNFT'
    | 'LEGACY_NFT'
    | 'MplCoreAsset'
  supply?: NFTSupply
  price?: {
    amount?: number
    currency?: string
    usdValue?: number
    lastSoldPrice?: number
  }
  marketplace?: {
    listed: boolean
    source?: string
    listingId?: string
    expiry?: number
  }
  rarity?: {
    rank?: number
    score?: number
    totalSupply?: number
  }
  owner?: string
  tokenAccount?: string
  address?: string
  royalty?: {
    percent?: number
    basisPoints?: number
  }
}

export interface Inscription {
  order: number
  size: number
  contentType: string
  encoding: string
  validationHash: string
  inscriptionDataAccount: string
  authority: string
}

export interface TokenWithInscription extends BaseToken {
  inscription: Inscription
}

export interface NativeBalance {
  lamports: number
  price_per_sol: number
  total_price: number
}

export interface TokenResponse {
  total: number
  limit: number
  page: number
  items: (FungibleToken | NFT | TokenWithInscription)[]
  nativeBalance?: NativeBalance
}
