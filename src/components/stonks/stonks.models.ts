export interface IStockInfo {
  mint: string
  symbol: string
  name: string
  decimals: number
  price: number
  change24h: number
  marketCap: number
  volume24h: number
}

export interface IStockPriceData {
  timestamp: number
  price: number
}
