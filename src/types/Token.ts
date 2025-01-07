// Common token properties
export interface BaseTokenInfo {
  id: string
  interface: string
  content: {
    $schema?: string
    metadata: {
      name: string
      symbol: string
      description: string
    }
    files?: Array<{
      uri: string
      type: string
      cdn_uri?: string
    }>
    links?: {
      image?: string
      external_url?: string
    }
  }
  authorities: Array<{
    address: string
    scopes: string[]
  }>
  ownership: {
    owner: string
    delegate: string
    frozen: boolean
    delegated: boolean
    ownership_model: string
  }
}

// NFT-specific properties
export interface NFTTokenInfo extends BaseTokenInfo {
  mutable: boolean
  burnt: boolean
  compression?: {
    compressed: boolean
    eligible: boolean
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
}

// Fungible token-specific properties
export interface FungibleTokenInfo extends BaseTokenInfo {
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
  royalty?: {
    royalty_model: string
    target: string
    percent: number
    basis_points: number
    primary_sale_happened: boolean
    locked: boolean
  }
}

export type TokenInfo = {
  result?: NFTTokenInfo | FungibleTokenInfo
}
