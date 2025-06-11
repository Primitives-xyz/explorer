import { TradeLogData } from '@/app/api/trades/log/route'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { SOL_MINT } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useRef } from 'react'
import { useLogTrade } from './use-trade-data'

interface SwapSuccessEventDetail {
  signature: string
  inputMint: string
  outputMint: string
  inputAmount: number
  outputAmount: number
  inputTokenUsdPrice: number
  outputTokenUsdPrice: number
  inputTokenSymbol: string
  outputTokenSymbol: string
  inputTokenDecimals: number
  outputTokenDecimals: number
  sourceWallet?: string
  sourceTransactionId?: string
  platform: 'trenches' | 'main'
  quoteResponse?: any
  source?: string
  slippage?: number
  priorityFee?: number
}

interface UseAutoTradeLoggerOptions {
  platform: 'trenches' | 'main'
  enabled?: boolean
}

export function useAutoTradeLogger(options: UseAutoTradeLoggerOptions) {
  const { platform, enabled = true } = options
  const { walletAddress } = useCurrentWallet()
  const { logTrade, isLoading } = useLogTrade()
  const processedTxRef = useRef(new Set<string>())

  // Cache SOL price to avoid redundant API calls
  const solPriceRef = useRef<number | null>(null)
  const lastPriceFetchRef = useRef<number>(0)

  // Only fetch SOL price if we don't have it cached or it's stale (> 30 seconds)
  const shouldFetchSolPrice =
    !solPriceRef.current || Date.now() - lastPriceFetchRef.current > 30000

  const { price: freshSolPrice } = useTokenUSDCPrice({
    tokenMint: SOL_MINT,
    decimals: 9,
  })

  // Update cached price when fresh price is available
  if (freshSolPrice && shouldFetchSolPrice) {
    solPriceRef.current = freshSolPrice
    lastPriceFetchRef.current = Date.now()
  }

  const solPrice = solPriceRef.current || freshSolPrice

  useEffect(() => {
    if (!enabled || !walletAddress) return

    const handleSwapSuccess = async (event: Event) => {
      const customEvent = event as CustomEvent<SwapSuccessEventDetail>
      const {
        signature,
        inputMint,
        outputMint,
        inputAmount,
        outputAmount,
        inputTokenUsdPrice,
        outputTokenUsdPrice,
        inputTokenSymbol,
        outputTokenSymbol,
        inputTokenDecimals,
        outputTokenDecimals,
        sourceWallet,
        sourceTransactionId,
        platform,
        quoteResponse,
        source,
        slippage,
        priorityFee,
      } = customEvent.detail

      // Avoid duplicate processing
      if (processedTxRef.current.has(signature)) {
        return
      }
      processedTxRef.current.add(signature)

      try {
        // Determine trade type
        let tradeType: 'buy' | 'sell' | 'swap' = 'swap'
        if (inputMint === SOL_MINT) {
          tradeType = 'buy'
        } else if (outputMint === SOL_MINT) {
          tradeType = 'sell'
        }

        // Calculate USD values using token prices
        const inputValueUSD = inputTokenUsdPrice
          ? inputAmount * inputTokenUsdPrice
          : undefined
        const outputValueUSD = outputTokenUsdPrice
          ? outputAmount * outputTokenUsdPrice
          : undefined

        // Try to derive SOL price from token USD prices first, fallback to cached price
        let derivedSolPrice = solPrice
        if (!derivedSolPrice && inputMint === SOL_MINT && inputTokenUsdPrice) {
          derivedSolPrice = inputTokenUsdPrice
        } else if (
          !derivedSolPrice &&
          outputMint === SOL_MINT &&
          outputTokenUsdPrice
        ) {
          derivedSolPrice = outputTokenUsdPrice
        }

        // Calculate SOL values using USD prices and SOL price
        const inputValueSOL =
          inputMint === SOL_MINT
            ? inputAmount
            : inputTokenUsdPrice && derivedSolPrice
            ? (inputAmount * inputTokenUsdPrice) / derivedSolPrice
            : undefined

        const outputValueSOL =
          outputMint === SOL_MINT
            ? outputAmount
            : outputTokenUsdPrice && derivedSolPrice
            ? (outputAmount * outputTokenUsdPrice) / derivedSolPrice
            : undefined

        // Extract additional data from quote response if available
        const extractedSlippage =
          slippage ||
          (quoteResponse?.slippageBps
            ? parseInt(quoteResponse.slippageBps)
            : undefined)
        const extractedSource =
          source || quoteResponse?.routePlan?.[0]?.swapInfo?.ammKey || 'unknown'

        const tradeData: TradeLogData = {
          transactionSignature: signature,
          walletAddress,
          inputMint,
          outputMint,
          inputAmount: inputAmount,
          outputAmount: outputAmount,
          inputValueSOL: inputValueSOL || 0,
          outputValueSOL: outputValueSOL || 0,
          inputValueUSD,
          outputValueUSD,
          solPrice: solPrice || undefined,
          timestamp: Date.now(),
          source: extractedSource,
          slippage: extractedSlippage,
          priorityFee,
          tradeType,
          platform,
          sourceWallet,
          sourceTransactionId,
        }

        await logTrade(tradeData)
        console.log('✅ Trade logged successfully:', signature)
      } catch (error) {
        console.error('❌ Failed to log trade:', error)
        // Remove from processed set so we can retry later
        processedTxRef.current.delete(signature)
      }
    }

    // Listen for swap success events
    window.addEventListener('swap-success', handleSwapSuccess)

    return () => {
      window.removeEventListener('swap-success', handleSwapSuccess)
    }
  }, [enabled, walletAddress, logTrade, platform, solPrice])

  // Cleanup processed transactions periodically (keep last 100)
  useEffect(() => {
    const interval = setInterval(() => {
      if (processedTxRef.current.size > 100) {
        const entries = Array.from(processedTxRef.current)
        const toKeep = entries.slice(-50) // Keep last 50
        processedTxRef.current.clear()
        toKeep.forEach((sig) => processedTxRef.current.add(sig))
      }
    }, 60000) // Clean up every minute

    return () => clearInterval(interval)
  }, [])

  return {
    isLoggingTrade: isLoading,
    processedTransactions: processedTxRef.current.size,
  }
}
