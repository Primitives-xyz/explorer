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

export interface Transaction {
  signature: string
  timestamp: number
  type: string
  source: string
  tokenTransfers?: TokenTransfer[]
  enrichedTokenTransfers?: EnrichedTokenTransfer[]
  // ... other fields
} 