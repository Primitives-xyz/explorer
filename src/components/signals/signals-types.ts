export type CreatedTokenEntry = {
  mint: string
  symbol: string
  name: string
  createdAt: number
  bondingProgress: number
  fullyBonded: boolean
  totalVolume: number
  creatorInitialBuySol: number
}

export type SelfSellEntry = {
  mint: string
  symbol: string
  sellVolume: number
  sellCount: number
  firstSellTime: number
}

export type CreatorProfile = {
  wallet: string
  tokensCreated: CreatedTokenEntry[]
  totalTokensCreated: number
  soldOwnTokens: boolean
  selfSellDetails: SelfSellEntry[]
  totalSellVolumeOwn: number
  firstSeen: number
  lastSeen: number
}

export type IndividualTrade = {
  signature: string
  isBuy: boolean
  solAmount: number
  tokenAmount: number
  timestamp: number
}

export type TokenProfitEntry = {
  mint: string
  symbol: string
  buyVolume: number
  sellVolume: number
  tradeCount: number
  trades: IndividualTrade[]
}

export type ProfitorProfile = {
  wallet: string
  totalSellVolume: number
  totalBuyVolume: number
  estimatedPnL: number
  tokensTraded: number
  tokenActivity: TokenProfitEntry[]
  biggestWin: { mint: string; symbol: string; pnl: number } | null
  firstSeen: number
  lastSeen: number
}

export type CreatorSelfSellAlert = {
  wallet: string
  mint: string
  symbol: string
  sellVolume: number
  timestamp: number
}
