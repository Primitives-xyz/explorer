'use client'

import { SOL_MINT, SOLANA_PUBLIC_RPC_URL } from '@/utils/constants'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useState } from 'react'

interface TokenBalanceProps {
  walletAddress?: string
  tokenMint: string
}

const formatNumber = (value: string) => {
  const num = parseFloat(value)
  if (isNaN(num)) return '0'

  // For very large numbers, use abbreviations
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(3) + 'M'
  }

  if (num >= 10_000) {
    return (num / 1_000).toFixed(3) + 'K'
  }

  // For smaller numbers, show more precision
  if (num >= 1000) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  if (num >= 100) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    })
  }

  if (num >= 10) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  }

  if (num >= 1) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }

  // For very small numbers, show up to 8 decimal places
  if (num > 0) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    })
  }

  return '0'
}

export const TokenBalance = ({
  walletAddress,
  tokenMint,
}: TokenBalanceProps) => {
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) return

      setLoading(true)
      try {
        if (tokenMint === SOL_MINT) {
          const response = await fetch(SOLANA_PUBLIC_RPC_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getBalance',
              params: [walletAddress, { commitment: 'confirmed' }],
            }),
          })
          const data = await response.json()
          if (!data.error) {
            const solBalance = (data.result?.value || 0) / LAMPORTS_PER_SOL
            setBalance(formatNumber(solBalance.toString()))
          }
        } else {
          const response = await fetch(
            `/api/tokens/balance?walletAddress=${walletAddress}&mintAddress=${tokenMint}`
          )
          const data = await response.json()
          setBalance(formatNumber(data.balance.uiAmountString))
        }
      } catch (error) {
        console.error('Error fetching token balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    // Refresh balance every 5 minutes instead of every minute
    const interval = setInterval(fetchBalance, 5 * 60000)

    return () => clearInterval(interval)
  }, [walletAddress, tokenMint])

  if (!walletAddress) return null

  return <span className="">{loading ? '...' : balance}</span>
}
