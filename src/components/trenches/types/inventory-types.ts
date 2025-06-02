export interface InventoryPosition {
  mint: string
  symbol: string
  name: string
  image?: string
  averageBuyPrice: number // in SOL
  totalAmount: number // in tokens
  totalInvested: number // in SOL
  currentPrice: number // in SOL
  transactions: InventoryTransaction[]
  lastUpdated: number
}

export interface InventoryTransaction {
  id: string
  type: 'buy' | 'sell'
  amount: number // in tokens
  price: number // in SOL
  totalValue: number // in SOL
  timestamp: number
  txSignature?: string
}

export interface InventoryStats {
  totalInvested: number // in SOL
  currentValue: number // in SOL
  totalPnL: number // in SOL
  totalPnLPercent: number
  winningPositions: number
  losingPositions: number
}
