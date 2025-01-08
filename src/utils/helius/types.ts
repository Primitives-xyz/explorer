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
  // Extended fields from primscan metadata
  tokenStandard?: string
  content?: {
    $schema?: string
    json_uri?: string
    files?: Array<{
      uri: string
      cdn_uri?: string
      mime?: string
    }>
    metadata?: {
      description?: string
      token_standard?: string
      attributes?: Array<{
        trait_type: string
        value: string | number
      }>
    }
  }
  token_info?: {
    supply?: number
    decimals?: number
    token_program?: string
    price_info?: {
      price_per_token: number
      currency: string
      volume_24h?: number
    }
  }
}

export interface NFTToken {
  id: string
  interface: string
  content?: {
    $schema?: string
    json_uri?: string
    files?: Array<{
      uri: string
      cdn_uri?: string
      mime?: string
    }>
    metadata?: {
      name?: string
      symbol?: string
      description?: string
      token_standard?: string
      attributes?: Array<{
        trait_type: string
        value: string | number
      }>
    }
    links?: {
      image?: string
    }
  }
  authorities?: Array<{
    address: string
    scopes: string[]
  }>
  compression?: {
    eligible: boolean
    compressed: boolean
    data_hash?: string
    creator_hash?: string
    asset_hash?: string
    tree?: string
    seq?: number
    leaf_id?: number
  }
  royalty?: {
    royalty_model: string
    target: string | null
    percent: number
    basis_points: number
    primary_sale_happened: boolean
    locked: boolean
  }
}

export interface ParsedInstruction {
  programId: string
  data: string
  accounts: string[]
  decodedData?: any
}

export interface TokenBalanceChange {
  userAccount: string
  tokenAccount: string
  mint: string
  rawTokenAmount: {
    tokenAmount: string
    decimals: number
  }
}

export interface AccountData {
  account: string
  nativeBalanceChange: number
  tokenBalanceChanges: TokenBalanceChange[]
}

export interface SwapTokenInfo {
  fromTokenAccount: string
  toTokenAccount: string
  fromUserAccount: string
  toUserAccount: string
  tokenAmount: number
  mint: string
  tokenStandard: string
}

export interface SwapProgramInfo {
  source: string
  account: string
  programName: string
  instructionName: string
}

export interface InnerSwap {
  tokenInputs: SwapTokenInfo[]
  tokenOutputs: SwapTokenInfo[]
  tokenFees: any[]
  nativeFees: any[]
  programInfo: SwapProgramInfo
}

export interface SwapEvent {
  nativeInput?: {
    account: string
    amount: string
  }
  nativeOutput?: {
    account: string
    amount: string
  }
  tokenInputs: SwapTokenInfo[]
  tokenOutputs: SwapTokenInfo[]
  tokenFees: any[]
  nativeFees: any[]
  innerSwaps: InnerSwap[]
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
  sourceWallet?: string
  nativeTransfers: {
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }[]
  tokenTransfers: {
    fromTokenAccount: string
    toTokenAccount: string
    fromUserAccount: string
    toUserAccount: string
    tokenAmount: number
    mint: string
    tokenStandard: string
  }[]
  accountData: AccountData[]
  parsedInstructions?: ParsedInstruction[]
  events?: {
    swap?: SwapEvent
  }
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
