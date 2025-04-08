export interface ISearchTokensResponse {
  data: {
    items: Item[]
  }
  success: boolean
}

export interface Item {
  type: string
  result: ISearchToken[]
}

export interface ISearchToken {
  name: string
  symbol: string
  address: string
  network: string
  decimals: number
  logo_uri?: string
  verified: boolean
  fdv: number
  market_cap: number
  liquidity: number
  price: number
  price_change_24h_percent: number
  sell_24h: number
  sell_24h_change_percent?: number
  buy_24h: number
  buy_24h_change_percent?: number
  unique_wallet_24h: number
  unique_wallet_24h_change_percent?: number
  trade_24h: number
  trade_24h_change_percent?: number
  volume_24h_change_percent?: number
  volume_24h_usd: number
  last_trade_unix_time: number
  last_trade_human_time: string
  supply?: number
  updated_time: number
  creation_time?: string
}
