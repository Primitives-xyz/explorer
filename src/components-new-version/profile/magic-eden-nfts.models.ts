export interface INft {
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
  externalUrl: string
  attributes: Attribute[]
  properties: Properties
  price: number
  listStatus: string
  tokenAddress: string
  priceInfo: PriceInfo
}

export interface Attribute {
  trait_type: string
  value: string
}

export interface Properties {
  files: File[]
  category: string
}

export interface File {
  uri: string
  type: string
}

export interface PriceInfo {
  solPrice: SolPrice
}

export interface SolPrice {
  rawAmount: string
  address: string
  decimals: number
}
