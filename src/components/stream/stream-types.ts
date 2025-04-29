// Types and interfaces for stream components

export interface TradeEvent {
  mint: string
  solAmount: string
  tokenAmount: string
  isBuy: boolean
  user: string
  timestamp: string
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

export interface MintAggregate {
  mint: string
  trades: StreamMessage[]
  totalBuy: number
  totalSell: number
  lastTrade: StreamMessage | null
  tpsTimestamps?: number[]
  tps?: number
  lastUpdate?: number // unix ms
}

export interface TokenModalState {
  open: boolean
  mint: string | null
} 