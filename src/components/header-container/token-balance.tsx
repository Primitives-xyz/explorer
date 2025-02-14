'use client'

import { useEffect, useState } from 'react'

interface TokenBalanceProps {
  walletAddress?: string
}

const formatNumber = (value: string) => {
  const num = parseFloat(value)
  if (isNaN(num)) return '0'

  // Format numbers greater than 1 million
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M'
  }
  // Format numbers greater than 1 thousand
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K'
  }
  // Format small numbers with max 2 decimal places
  return num.toFixed(Math.min(2, value.split('.')[1]?.length || 0))
}

export const TokenBalance = ({ walletAddress }: TokenBalanceProps) => {
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) return

      setLoading(true)
      try {
        const response = await fetch(
          `/api/tokens/balance?walletAddress=${walletAddress}&mintAddress=H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump`
        )
        const data = await response.json()
        setBalance(formatNumber(data.balance.uiAmountString))
      } catch (error) {
        console.error('Error fetching token balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    // Refresh balance every minute
    const interval = setInterval(fetchBalance, 60000)

    return () => clearInterval(interval)
  }, [walletAddress])

  if (!walletAddress) return null

  return <span className="">{loading ? '...' : balance}</span>
}
