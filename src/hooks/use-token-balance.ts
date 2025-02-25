import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

const SOL_MINT = 'So11111111111111111111111111111111111111112'
const LAMPORTS_PER_SOL = 1000000000
const REFRESH_INTERVAL = 10000 // 10 seconds

export function useTokenBalance(walletAddress?: string, mintAddress?: string) {
  const [balance, setBalance] = useState<{ formatted: string; raw: bigint }>({
    formatted: '0',
    raw: 0n,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const t = useTranslations()

  const formatBalance = (value: string, isSol = false) => {
    const num = parseFloat(value)
    if (isNaN(num)) return { formatted: '0', raw: 0n }

    // Calculate raw value in base units
    const raw = isSol
      ? BigInt(Math.round(num * LAMPORTS_PER_SOL))
      : BigInt(Math.round(num * Math.pow(10, 6))) // Assuming non-SOL tokens use 6 decimals

    // Format numbers greater than 1 million
    if (num >= 1_000_000) {
      return {
        formatted: (num / 1_000_000).toFixed(2) + t('common.m'),
        raw,
      }
    }
    // Format numbers greater than 1 thousand
    if (num >= 1_000) {
      return {
        formatted: (num / 1_000).toFixed(2) + t('common.k'),
        raw,
      }
    }

    // Special handling for SOL balances
    if (isSol) {
      if (num >= 1) {
        // For SOL >= 1, show up to 3 decimal places
        return {
          formatted: num.toFixed(3),
          raw,
        }
      }
      // For SOL < 1, show up to 4 decimal places
      return {
        formatted: num.toFixed(4),
        raw,
      }
    }

    // For other tokens, show up to 2 decimal places
    return {
      formatted: num.toFixed(2),
      raw,
    }
  }

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress || !mintAddress) return

      // Only set loading true on initial load, not refreshes
      if (!balance.formatted) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }

      setError(null)
      try {
        // Handle SOL balance differently using direct RPC call
        if (mintAddress === SOL_MINT) {
          const response = await fetch(
            process.env.NEXT_PUBLIC_RPC_URL ||
              'https://api.mainnet-beta.solana.com',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getBalance',
                params: [walletAddress],
              }),
            }
          )
          const data = await response.json()
          if (data.error) {
            throw new Error(data.error.message)
          }
          const solBalance = (data.result?.value || 0) / LAMPORTS_PER_SOL
          setBalance(formatBalance(solBalance.toString(), true))
        } else {
          // Handle SPL tokens
          const response = await fetch(
            `/api/tokens/balance?walletAddress=${walletAddress}&mintAddress=${mintAddress}`
          )
          const data = await response.json()
          setBalance(formatBalance(data.balance.uiAmountString))
        }
      } catch (error) {
        console.error(t('error.error_fetching_token_balance'), error)
        setError(t('error.failed_to_fetch_balance'))
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchBalance()
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [walletAddress, mintAddress])

  return {
    balance: balance.formatted,
    rawBalance: balance.raw,
    loading,
    error,
    isRefreshing,
  }
}
