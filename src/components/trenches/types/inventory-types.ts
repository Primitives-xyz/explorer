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
  offPlatformPenalty?: boolean // Flag for positions penalized due to off-platform trading
  realizedPnL?: number // Realized profit/loss from completed transactions (in SOL)
  fullyRealized?: boolean // Position fully closed due to slippage tolerance
  partialSoldOffPlatform?: boolean // Some tokens sold off-platform
  averageSellPrice?: number // Average price tokens were sold at (for closed positions)
  externalPurchase?: boolean // Tokens purchased outside of tracked transactions
  hasPriceData?: boolean // Whether we have current price data (not using entry price fallback)
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
  totalPnL: number // in SOL (includes both realized and unrealized)
  totalPnLPercent: number
  winningPositions: number
  losingPositions: number
  totalRealizedPnL?: number // in SOL (only realized P&L from completed trades)
  fullyRealizedPositions?: number // Count of positions fully closed
}
