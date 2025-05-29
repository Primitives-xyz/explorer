'use client'

import { useTokenBalance } from '@/components/trade/hooks/use-token-balance'

interface TokenBalanceProps {
  walletAddress?: string
  tokenMint: string
}

const formatNumber = (value: string) => {
  const num = parseFloat(value)
  if (isNaN(num)) return '0'

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M'
  }

  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K'
  }

  return num.toFixed(Math.min(2, value.split('.')[1]?.length || 0))
}

export const TokenBalance = ({
  walletAddress,
  tokenMint,
}: TokenBalanceProps) => {
  const { balance, loading } = useTokenBalance(walletAddress, tokenMint)

  if (!walletAddress) return null

  return <span className="">{loading ? '...' : balance}</span>
}
