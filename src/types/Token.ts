export interface Token {
  interface: string
  id: string
  content: {
    $schema: string
    json_uri: string
    files: any[]
    metadata: {
      attributes?: Attribute[]
      description?: string
      name: string
      symbol: string
    }
    links: {
      image?: string
    }
  }
  token_info: {
    symbol: string
    balance: number
    decimals: number
    price_info?: {
      price_per_token: number
      total_price: number
      currency: string
    }
  }
}

export interface Attribute {
  value: string
  trait_type: string
}
