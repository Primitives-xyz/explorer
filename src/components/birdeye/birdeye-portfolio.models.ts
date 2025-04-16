export interface IGetProfilePortfolioResponse {
  success: boolean
  data: {
    wallet: string
    totalUsd: number
    items: ITokenPortfolioItem[]
  }
}

export interface ITokenPortfolioItem {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string
  uiAmount: number
  chainId: string
  logoURI: string
  icon: string
  priceUsd: number
  valueUsd: number
}
