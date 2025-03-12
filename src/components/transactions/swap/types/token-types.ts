export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  icon?: string
  chainId?: string
}

export interface TokenSearchResult extends TokenInfo {
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

export interface SortOption {
  value: 'marketcap' | 'volume' | 'name' | 'balance'
  label: string
}

export interface TokenSearchProps {
  onSelect: (token: TokenInfo) => void
  onClose: () => void
  hideWhenGlobalSearch?: boolean
}
