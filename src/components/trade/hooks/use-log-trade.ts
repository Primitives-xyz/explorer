import { useCallback } from 'react'

export interface LogTradeParams {
  signature: string
  inputMint: string
  outputMint: string
  inputAmount: string
  expectedOutput: string
  priceImpact: string
  slippageBps: number
  priorityLevel: string
  inputDecimals: number
  walletAddress: string
  usdcFeeAmount?: string
  currentUSDCPrice?: string
  tradeType: 'copied' | 'direct'
  copyWallet: string | null // If tradeType is 'direct', this should be null
  // Add any other fields you want to log
}

export function useLogTrade() {
  const logTrade = useCallback(async (params: LogTradeParams) => {
    try {
      await fetch('/api/trade-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
    } catch (err) {
      console.error('Error logging trade:', err)
    }
  }, [])

  return { logTrade }
} 