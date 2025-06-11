import { useEffect, useState } from 'react'

export interface Transaction {
  id?: number
  inputAmount: number
  outputAmount: number
  inputValueSOL: number
  outputValueSOL: number
  inputValueUSD?: number
  outputValueUSD?: number
  solPrice?: number
  profileId?: string
  source?: string
  slippage?: number
  priorityFee?: number
  sourceWallet?: string
  sourceTransactionId?: string
  transactionSignature?: string
  inputMint: string
  outputMint: string
  tradeType?: 'buy' | 'sell' | 'swap'
  timestamp?: number
  platform?: 'trenches' | 'main'
  walletAddress?: string
  createdAt?: string
  updatedAt?: string
}

export function useTapestryTransactionHistory(
  walletAddress: string,
  enabled: boolean = true
) {
  const [transactions, setTransactions] = useState<Transaction[] | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState<Error | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  // console.log(
  //   '🔍 useTapestryTransactionHistory called with walletAddress:',
  //   walletAddress,
  //   'enabled:',
  //   enabled
  // )

  useEffect(() => {
    // Only fetch if:
    // 1. We're enabled
    // 2. We have a valid wallet address
    // 3. We haven't already fetched for this wallet
    const shouldFetch =
      enabled && walletAddress && walletAddress.length > 32 && !hasFetched

    if (!shouldFetch) {
      return
    }

    console.log('🌐 Starting fetch for wallet:', walletAddress)
    setIsLoading(true)
    setIsError(null)

    const fetchTransactions = async () => {
      try {
        const url = `/api/trades/fetch-transaction-history?walletAddress=${walletAddress}`
        console.log('🌐 Fetching from URL:', url)

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('📊 Fetched transaction history:', data)

        setTransactions(data)
        setHasFetched(true)
      } catch (error) {
        console.error('❌ Error fetching transaction history:', error)
        setIsError(error instanceof Error ? error : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [enabled, walletAddress])

  // Reset when wallet changes
  useEffect(() => {
    setHasFetched(false)
    setTransactions(undefined)
    setIsError(null)
  }, [walletAddress])

  // console.log('📊 Hook state:', {
  //   hasData: !!transactions,
  //   dataLength: transactions?.length,
  //   isError: !!isError,
  //   errorMessage: isError?.message,
  //   walletAddress,
  //   enabled,
  //   hasFetched,
  //   isLoading,
  // })

  return {
    transactions,
    isLoading,
    isError,
  }
}
