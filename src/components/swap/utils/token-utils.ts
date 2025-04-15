import { ITokenSearchResult } from '@/components/swap/swap.models'

export const DEFAULT_TOKENS: ITokenSearchResult[] = [
  {
    name: 'Solana Social Explorer',
    symbol: 'SSE',
    address: 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',
    decimals: 6,
    logoURI:
      'https://ipfs.io/ipfs/QmT4fG3jhXv3dcvEVdkvAqi8RjXEmEcLS48PsUA5zSb1RY',
    verified: true,
    market_cap: 7836380.32118586,
    price: 0.007971767374586932,
    volume_24h_usd: 10566433.718458362,
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    verified: true,
    market_cap: 1842335985.249657,
    price: 1,
    volume_24h_usd: 76544935.249657,
  },
  {
    name: 'Wrapped SOL',
    symbol: 'SOL',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    verified: true,
    market_cap: 47835674523.34,
    price: 109.23,
    volume_24h_usd: 1234567890.34,
  },
  {
    name: 'Jupiter',
    symbol: 'JUP',
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    decimals: 6,
    logoURI: 'https://static.jup.ag/jup/icon.png',
    verified: true,
    market_cap: 2514767005.3796864,
    price: 0.8002922960187652,
    volume_24h_usd: 78987069.65993138,
  },
]

export const formatMarketCap = (
  marketCap: number | null,
  noMCapText: string
) => {
  if (!marketCap) return noMCapText

  // Handle very large numbers more gracefully
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}T`
  }
  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}B`
  }
  if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}M`
  }
  if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}K`
  }
  return `$${marketCap.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`
}

export const formatPrice = (price: number | null) => {
  if (!price) return ''

  // For extremely small values (less than 0.000001)
  if (price < 0.000001) {
    // For values less than 0.00000001, use scientific notation
    if (price < 0.00000001) {
      return `$${price.toExponential(4)}`
    }
    // For small but not tiny values, show more decimal places
    return `$${price.toLocaleString(undefined, {
      maximumFractionDigits: 10,
      minimumFractionDigits: 8,
    })}`
  }

  // For small values (less than 0.01)
  if (price < 0.01) {
    return `$${price.toLocaleString(undefined, {
      maximumFractionDigits: 8,
      minimumFractionDigits: 6,
    })}`
  }

  // For normal values
  return `$${price.toLocaleString(undefined, {
    maximumFractionDigits: 6,
    minimumFractionDigits: 2,
  })}`
}

export const sortTokenResults = (
  results: ITokenSearchResult[],
  sortBy: string
) => {
  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'marketcap':
        if (a.verified !== b.verified) {
          return b.verified ? 1 : -1
        }
        return b.market_cap - a.market_cap
      case 'volume':
        if (a.verified !== b.verified) {
          return b.verified ? 1 : -1
        }
        return b.volume_24h_usd - a.volume_24h_usd
      case 'balance':
        // Convert balance to number for comparison
        const aBalance = a.uiAmount || 0
        const bBalance = b.uiAmount || 0
        return bBalance - aBalance
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })
}
