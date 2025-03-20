import { DAS } from 'helius-sdk'

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

export interface CompressedNFTMintEvent {
  type: 'COMPRESSED_NFT_MINT'
  assetId: string
  newOwner: string
  metadata: {
    name: string
    symbol: string
    uri: string
    sellerFeeBasisPoints: number
    primarySaleHappened: boolean
    isMutable: boolean
    tokenStandard: string
    tokenProgramVersion: string
    creators: Array<{
      address: string
      share: number
      verified: boolean
    }>
  }
}

export type TransactionEvent =
  | { type: 'SWAP'; swap: SwapEvent }
  | CompressedNFTMintEvent

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
    tokenMint: string
    amount: number
    from: string
    to: string
    fromUserAccount: string
    toUserAccount: string
    tokenAmount: number
    tokenStandard: string
  }[]
  accountData: AccountData[]
  parsedInstructions?: ParsedInstruction[]
  events?: TransactionEvent[]
  balanceChanges: {
    [address: string]: number
  }
}

export interface FungibleTokenDetailsProps {
  id: string
  tokenInfo: {
    id: string
    interface: string
    content: DAS.Content
    authorities: Array<{
      address: string
      scopes: string[]
    }>
    royalty?: {
      royalty_model: string
      target: string | null
      percent: number
      basis_points: number
      primary_sale_happened: boolean
      locked: boolean
    }
    ownership: {
      owner: string
      delegate: string | null
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

export interface Transfer {
  to: string
  from: string
  amount: number
}

export interface Instruction {
  programId: string
  accounts: string[]
  data: string
  innerInstructions?: {
    programId: string
    accounts: string[]
    data: string
  }[]
  decodedData?: {
    name: string
    data?: any
    type?: string
  }
}

export interface TokenTransfer {
  fromTokenAccount: string
  toTokenAccount: string
  fromUserAccount: string
  toUserAccount: string
  tokenAmount: number
  mint: string
  tokenStandard: string
}

export interface ExtendedTransaction
  extends Omit<
    Transaction,
    | 'nativeTransfers'
    | 'tokenTransfers'
    | 'accountData'
    | 'balanceChanges'
    | 'events'
  > {
  transfers?: Transfer[]
  instructions?: Instruction[]
  parsedInstructions?: Instruction[]
  accountData?: AccountData[]
  accountsInvolved?: string[]
  nativeTransfers?: {
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }[]
  balanceChanges?: { [address: string]: number }
  tokenTransfers?: TokenTransfer[]
  events?: TransactionEvent[]
}
