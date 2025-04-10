export interface IGetTrendingTokensResponse {
  data: Data
  success: boolean
}

export interface Data {
  updateUnixTime: number
  updateTime: string
  tokens: ITrendingToken[]
  total: number
}

export interface ITrendingToken {
  address: string
  decimals: number
  liquidity: number
  logoURI: string
  name: string
  symbol: string
  volume24hUSD: number
  volume24hChangePercent?: number
  fdv: number
  marketcap: number
  rank: number
  price: number
  price24hChangePercent: number
}
