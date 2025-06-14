// Types and interfaces for stream components

export interface TradeEvent {
  mint: string
  solAmount: string
  tokenAmount: string
  isBuy: boolean
  user: string
  timestamp: string
  realSolReserves?: string
  virtualSolReserves?: string
  [key: string]: any
}

export interface StreamMessage {
  type: string
  signature: string
  slot: number
  success: boolean
  timestamp: string
  eventData: {
    tradeEvents: TradeEvent[]
    [key: string]: any
  }
  [key: string]: any
}

export interface WalletVolume {
  buyVolume: number
  sellVolume: number
  totalVolume: number
  tradeCount: number
}

export interface MintAggregate {
  mint: string
  trades: StreamMessage[]
  totalBuy: number
  totalSell: number
  lastTrade: StreamMessage | null
  tpsTimestamps?: number[]
  tps?: number
  lastUpdate?: number // unix ms
  tokenCreatedAt?: number | null
  uniqueTraders?: Set<string>
  walletVolumes?: Record<string, WalletVolume>
  volumePerToken?: number
  mintSymbol?: string
  mintName?: string
  mintImage?: string
  decimals?: number
  topWallets?: Array<{ wallet: string; totalVolume: number }>
  pricePerToken?: number | null
  realLiquidity?: number | null
  realSolReserves?: number | string
  bondingProgress?: number
  aboutToGraduate?: boolean
  fullyBonded?: boolean
  source?: 'Pump' | 'Jester' | 'Believe' | 'Vertigo' | 'Meteora' | 'Unknown'
}

export interface TokenModalState {
  open: boolean
  mint: string | null
}
