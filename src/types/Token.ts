import { DAS } from 'helius-sdk'

// Common token properties
export interface BaseTokenInfo {
  interface: string
  id: string
  content: DAS.Content
  metadata: {
    name: string
    symbol: string
    description: string
    attributes?: Array<{
      trait_type: string
      value: string
    }>
  }
  links?: {
    image?: string
    external_url?: string
  }
  authorities: Array<{
    address: string
    scopes: string[]
  }>
  ownership: {
    owner: string
    delegate: string | null
    frozen: boolean
    delegated: boolean
    ownership_model: string
  }
  compression?: {
    eligible: boolean
    compressed: boolean
    data_hash: string
    creator_hash: string
    asset_hash: string
    tree: string
    seq: number
    leaf_id: number
  }
  grouping?: Array<{
    group_key: string
    group_value: string
  }>
  royalty?: {
    royalty_model: string
    target: string | null
    percent: number
    basis_points: number
    primary_sale_happened: boolean
    locked: boolean
  }
  creators?: Array<{
    address: string
    verified?: boolean
    share?: number
  }>
  supply?: any
  mutable: boolean
  burnt: boolean
  plugins?: Record<string, any>
  mpl_core_info?: {
    plugins_json_version: number
  }
  external_plugins?: any[]
}

export interface NFTMetadata {
  name: string
  symbol: string
  description: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
  collection?: {
    key?: string
    name?: string
    verified?: boolean
  }
  sellerFeeBasisPoints?: number
  primarySaleHappened?: boolean
  isMutable?: boolean
  editionNonce?: number
  tokenStandard?: string
  tokenProgramVersion?: string
  creators?: Array<{
    address: string
    verified: boolean
    share: number
  }>
}

// NFT-specific properties
export interface NFTCollectionInfo extends BaseTokenInfo {
  interface: 'Mpl Core Asset'
}

export interface NFTTokenInfo extends BaseTokenInfo {
  interface:
    | 'V1_NFT'
    | 'V2_NFT'
    | 'LEGACY_NFT'
    | 'ProgrammableNFT'
    | 'MplCoreCollection'
}

// Fungible token-specific properties
export interface FungibleTokenInfo extends BaseTokenInfo {
  interface: 'FungibleToken' | 'FungibleAsset'
  token_info: {
    symbol: string
    supply: number
    decimals: number
    token_program: string
    price_info?: {
      price_per_token: number
      currency: string
      volume_24h?: number
    }
  }
}

export interface TokenResponse {
  jsonrpc: string
  result: NFTTokenInfo | FungibleTokenInfo
  id: string
}

export type TokenInfo = {
  result?: NFTTokenInfo | FungibleTokenInfo
}

export interface TokenPortfolioItem {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string
  uiAmount: number
  chainId: string
  logoURI: string
  icon: string
  priceUsd: number
  valueUsd: number
}

export interface TokenPortfolioResponse {
  success: boolean
  data: {
    wallet: string
    totalUsd: number
    items: TokenPortfolioItem[]
  }
}
