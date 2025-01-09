export interface TokenMetadata {
  symbol: string
  name: string
  image: string
  decimals: number
}

export interface TokenTransfer {
  tokenMint: string
  from: string
  to: string
  amount: number
  metadata?: TokenMetadata
}

export interface EnrichedTokenTransfer extends TokenTransfer {
  metadata?: TokenMetadata
}

export interface NativeTransfer {
  fromUserAccount: string
  toUserAccount: string
  amount: number
}

export interface ParsedInstruction {
  programId: string
  data: string
  accounts: string[]
  decodedData?: any
}

export interface Transaction {
  signature: string
  timestamp: number
  type: string
  source: string
  slot?: number
  fee?: number
  feePayer?: string
  description?: string
  nativeTransfers?: NativeTransfer[]
  parsedInstructions?: ParsedInstruction[]
  tokenTransfers?: TokenTransfer[]
  enrichedTokenTransfers?: EnrichedTokenTransfer[]
} 