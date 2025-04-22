import { Order, PerpPosition } from '@drift-labs/sdk-browser'

export interface IUserStats {
  // User health
  health: number
  healthRatio: number | null

  // Net USD Value
  netUsdValue: number

  // Leverage
  leverage: number

  // Positions
  perpPositions: PerpPosition[]
  orders: Order[]

  // Trading limits
  maxLeverage: number
  maxTradeSize: number
}

export enum MarketType {
  SPOT = 'spot',
  PERP = 'perp',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  PRO = 'pro',
}

export enum ProOrderType {
  STOP_MARKET = 'Stop Market',
  STOP_LIMIT = 'Stop Limit',
  TAKE_PROFIT_MARKET = 'Take Profit',
  TAKE_PROFIT_LIMIT = 'Take Profit Limit',
  ORACLE_Limit = 'Oracle Market',
  SCALE = 'Scale',
}

export enum PerpsMarketType {
  SOL = 'SOL',
  USDC = 'USDC',
}

export enum DirectionFilterType {
  LONG = 'long',
  SHORT = 'short',
}

