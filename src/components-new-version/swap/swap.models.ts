export interface ITokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  icon?: string
  chainId?: string
}

export interface ITokenSearchResult extends ITokenInfo {
  price: number | null
  volume_24h_usd: number
  verified: boolean
  market_cap: number
  balance?: number | string
  uiAmount?: number
  valueUsd?: number
  priceUsd?: number
  prioritized?: boolean
}

export interface ISortOption {
  value: 'marketcap' | 'volume' | 'name' | 'balance'
  label: string
}

export interface ITokenSearchProps {
  onSelect: (token: ITokenInfo) => void
  onClose: () => void
  openModal: boolean
}

export enum ESwapMode {
  EXACT_IN = 'ExactIn',
  EXACT_OUT = 'ExactOut',
}

export interface ISwapInputs {
  inputMint: string
  outputMint: string
  inputAmount: number
  outputAmount: number
  mode: ESwapMode
}
