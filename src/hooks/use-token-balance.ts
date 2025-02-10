import { useState, useEffect } from 'react'

const SOL_MINT = 'So11111111111111111111111111111111111111112'
const LAMPORTS_PER_SOL = 1000000000

const formatBalance = (value: string, isSol = false) => {
  const num = parseFloat(value)
  if (isNaN(num)) return { formatted: '0', raw: 0 }

  // Format numbers greater than 1 million
  if (num >= 1_000_000) {
    return {
      formatted: (num / 1_000_000).toFixed(2) + 'M',
      raw: num,
    }
  }
  // Format numbers greater than 1 thousand
  if (num >= 1_000) {
    return {
      formatted: (num / 1_000).toFixed(2) + 'K',
      raw: num,
    }
  }

  // Special handling for SOL balances
  if (isSol) {
    if (num >= 1) {
      // For SOL >= 1, show up to 3 decimal places
      return {
        formatted: num.toFixed(3),
        raw: num,
      }
    }
    // For SOL < 1, show up to 4 decimal places
    return {
      formatted: num.toFixed(4),
      raw: num,
    }
  }

  // For other tokens, show up to 2 decimal places
  return {
    formatted: num.toFixed(2),
    raw: num,
  }
}

export function useTokenBalance(walletAddress?: string, mintAddress?: string) {
  const [balance, setBalance] = useState<{ formatted: string; raw: number }>({
    formatted: '0',
    raw: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress || !mintAddress) return

      setLoading(true)
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
            },
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
            `/api/tokens/balance?walletAddress=${walletAddress}&mintAddress=${mintAddress}`,
          )
          const data = await response.json()
          setBalance(formatBalance(data.balance.uiAmountString))
        }
      } catch (error) {
        console.error('Error fetching token balance:', error)
        setError('Failed to fetch balance')
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    // Refresh balance every minute
    const interval = setInterval(fetchBalance, 60000)

    return () => clearInterval(interval)
  }, [walletAddress, mintAddress])

  return { balance: balance.formatted, rawBalance: balance.raw, loading, error }
}
