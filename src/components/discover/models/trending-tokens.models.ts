import { IGetProfileOwnSpecificToken } from '@/components/tapestry/models/token.models'

export interface IGetTrendingTokensWithHoldersResponse {
  data: IDataWithHolders
  success: boolean
}

export interface IDataWithHolders {
  updateUnixTime: number
  updateTime: string
  tokens: ITrendingTokenWidthHolders[]
  total: number
}

export interface ITrendingTokenWidthHolders {
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
  holders?: IGetProfileOwnSpecificToken
}
