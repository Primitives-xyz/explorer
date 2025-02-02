export interface BaseToken {
  id: string
  interface:
    | 'FungibleToken'
    | 'FungibleAsset'
    | 'V1_NFT'
    | 'V2_NFT'
    | 'ProgrammableNFT'
    | 'LEGACY_NFT'
  name: string
  symbol: string
  imageUrl: string | null
  mint: string
  compressed: boolean
  authorities: string[]
  creators: string[]
  mutable: boolean
  burnt: boolean
  content?: {
    $schema?: string
    json_uri?: string
    files?: Array<{
      uri: string
      cdn_uri?: string
      mime?: string
      type?: string
    }>
    metadata: {
      name: string
      symbol: string
      description: string
      attributes?: Array<{
        trait_type: string
        value: string
      }>
      image?: string
    }
    links?: {
      image?: string
      external_url?: string
    }
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

export interface NFTSupply {
  printMaxSupply: number
  printCurrentSupply: number
  editionNonce: number
  editionNumber: number
}

export interface NFT extends BaseToken {
  interface: 'V1_NFT' | 'V2_NFT' | 'ProgrammableNFT' | 'LEGACY_NFT'
  supply?: NFTSupply
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
