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

export interface NeccessaryOrderParams {
  orderType: string
  amount: string
}

export interface MarketOrderParams extends NeccessaryOrderParams {
  slippage: string
}

export interface LimitOrderParams extends NeccessaryOrderParams {
  slippage: string
  limitPrice: string
  reduceOnly: boolean
}

export interface TakeProfitOrderParams extends NeccessaryOrderParams {
  triggerPrice: string
  reduceOnly: boolean
}

export interface StopLimitOrderParams extends NeccessaryOrderParams {
  triggerPrice: string
  limitPrice: string
  reduceOnly: boolean
}

export interface AddTakeProfitOrderParams extends NeccessaryOrderParams {
  symbol: string
  currentPositionDirection: string
  triggerPrice: string
}

export interface AddStopLimitOrderParams extends NeccessaryOrderParams {
  symbol: string
  currentPositionDirection: string
  triggerPrice: string
  limitPrice: string
}

export enum MarketType {
  SPOT = 'spot',
  PERP = 'perp',
}

export enum OrderType {
  MARKET = 'Market_Order',
  LIMIT = 'Limit_Order',
  TP = 'Take_Profit',
  PRO = 'Pro_Orders',
  SL = 'Stop_Limit',
  ADD_TP = 'Add_Take_Profit',
  ADD_SL = 'Add_Stop_limit'
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
