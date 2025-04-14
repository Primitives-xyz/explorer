export interface IFungibleToken {
  id: string
  interface: string
  name: string
  symbol: string
  imageUrl: string
  mint: string
  compressed: boolean
  authorities: Authority[]
  creators: any[]
  mutable: boolean
  burnt: boolean
  content: Content
  balance: number
  decimals: number
  supply: number
  price: number
  totalPrice: number
  currency: string
  tokenProgram: string
  associatedTokenAddress: string
}

export interface Authority {
  address: string
  scopes: string[]
}

export interface Content {
  $schema: string
  json_uri: string
  files: File[]
  metadata: Metadata
  links: Links
}

export interface File {
  uri: string
  cdn_uri: string
  mime: string
}

export interface Metadata {
  description: string
  name: string
  symbol: string
}

export interface Links {
  image: string
}
