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

interface ParsedInstruction {
  programId: string
  data: string
  accounts: string[]
  decodedData?: any
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
    from: string
    to: string
    fromTokenAccount: string
    toTokenAccount: string
    amount: number
    tokenMint: string
  }[]
  parsedInstructions?: ParsedInstruction[]
  balanceChanges: {
    [address: string]: number
  }
}

export interface FungibleTokenDetailsProps {
  id: string
  tokenInfo: {
    id: string
    interface: string
    content: {
      metadata: {
        name: string
        symbol: string
        description: string
      }
      files?: Array<{
        uri: string
        type: string
      }>
      links?: {
        image?: string
      }
    }
    authorities: Array<{
      address: string
      scopes: string[]
    }>
    royalty?: {
      royalty_model: string
      target: string
      percent: number
      basis_points: number
      primary_sale_happened: boolean
      locked: boolean
    }
    ownership: {
      owner: string
      delegate: string
      frozen: boolean
      delegated: boolean
      ownership_model: string
    }
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
}
