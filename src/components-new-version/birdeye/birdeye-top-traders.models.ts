export enum ETimeFrame {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  ONE_WEEK = '1W',
}

export interface IGetTopTradersResponse {
  data: Data
  success: boolean
}

export interface Data {
  items: ITopTrader[]
}

export interface ITopTrader {
  network: string
  address: string
  pnl: number
  volume: number
  trade_count: number
}
