'use client'

import type {
  UltraExecuteResponse,
  UltraOrderResponse,
} from '@/types/jupiter-service'
import { PLATFORM_FEE_BPS } from '@/utils/constants'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useCreateTradeContentNodeWithScoring } from './use-create-trade-content-with-scoring'

interface UseJupiterSwapParams {
  inputMint: string
  outputMint: string
  inputAmount: string
  inputDecimals?: number
  outputDecimals?: number
  primaryWallet: any
  walletAddress: string
  swapMode?: string
  sourceWallet?: string
  sourceTransactionId?: string
}

// Status type compatible with existing UI (swap.tsx)
interface TransactionStatusUpdate {
  status:
    | 'sending'
    | 'sent'
    | 'confirming'
    | 'confirmed'
    | 'failed'
    | 'timeout'
  signature?: string
  error?: string
}

export function useJupiterSwap({
  inputMint,
  outputMint,
  inputAmount,
  inputDecimals,
  outputDecimals,
  primaryWallet,
  walletAddress,
  swapMode = 'ExactIn',
  sourceWallet,
  sourceTransactionId,
}: UseJupiterSwapParams) {
  const t = useTranslations()
  const [quoteResponse, setQuoteResponse] = useState<UltraOrderResponse | null>(
    null
  )
  const [expectedOutput, setExpectedOutput] = useState<string>('')
  const [txSignature, setTxSignature] = useState<string>('')
  const [isFullyConfirmed, setIsFullyConfirmed] = useState<boolean>(false)
  const [isQuoteRefreshing, setIsQuoteRefreshing] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [priceImpact, setPriceImpact] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<TransactionStatusUpdate | null>(null)
  const { createContentNode } = useCreateTradeContentNodeWithScoring()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  const resetQuoteState = useCallback(() => {
    setQuoteResponse(null)
    setExpectedOutput('')
    setPriceImpact('')
    setTxSignature('')
    setError(null)
    setIsFullyConfirmed(false)
    setIsQuoteRefreshing(false)
    setTxStatus(null)
  }, [])

  // Fetch a quote (order without taker) from Jupiter Ultra
  const fetchQuote = useCallback(async () => {
    if (
      Number(inputAmount) === 0 ||
      !inputAmount ||
      !inputMint ||
      !outputMint ||
      !outputDecimals ||
      !inputDecimals
    ) {
      resetQuoteState()
      return
    }

    try {
      if (quoteResponse) {
        setIsQuoteRefreshing(true)
      } else {
        setLoading(true)
      }

      const inputAmountInDecimals = Math.floor(
        Number(inputAmount) * Math.pow(10, inputDecimals)
      )

      // Call our Ultra order proxy (without taker = quote only)
      const url = new URL('/api/jupiter/order', window.location.origin)
      url.searchParams.set('inputMint', inputMint)
      url.searchParams.set('outputMint', outputMint)
      url.searchParams.set('amount', inputAmountInDecimals.toString())

      const response = await fetch(url.toString()).then((res) => res.json())

      if (response.error) {
        throw new Error(response.error)
      }

      const order: UltraOrderResponse = response

      if (swapMode === 'ExactIn') {
        setExpectedOutput(
          (Number(order.outAmount) / Math.pow(10, outputDecimals)).toString()
        )
      } else {
        setExpectedOutput(
          (Number(order.inAmount) / Math.pow(10, outputDecimals)).toString()
        )
      }

      setPriceImpact(order.priceImpactPct)
      setQuoteResponse(order)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to fetch quote')
    } finally {
      setLoading(false)
      setIsQuoteRefreshing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputAmount,
    inputMint,
    inputDecimals,
    outputMint,
    outputDecimals,
    resetQuoteState,
  ])

  const refreshQuote = useCallback(() => {
    if (!isQuoteRefreshing && !loading) {
      fetchQuote()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuoteRefreshing, loading])

  const handleSwap = async () => {
    setLoading(true)
    setIsFullyConfirmed(false)
    setTxStatus({ status: 'sending' })
    setError(null)

    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError('Wallet not connected')
      setLoading(false)
      setTxStatus(null)
      return
    }

    if (!inputDecimals || !outputDecimals) {
      setError('Token decimals not loaded')
      setLoading(false)
      setTxStatus(null)
      return
    }

    try {
      // Step 1: Get a fresh order WITH taker (returns unsigned transaction)
      const inputAmountInDecimals = Math.floor(
        Number(inputAmount) * Math.pow(10, inputDecimals)
      )

      const orderUrl = new URL('/api/jupiter/order', window.location.origin)
      orderUrl.searchParams.set('inputMint', inputMint)
      orderUrl.searchParams.set('outputMint', outputMint)
      orderUrl.searchParams.set('amount', inputAmountInDecimals.toString())
      orderUrl.searchParams.set('taker', walletAddress)

      const orderResponse: UltraOrderResponse = await fetch(
        orderUrl.toString()
      ).then((res) => res.json())

      if (orderResponse.errorCode || (orderResponse as any).error) {
        const errMsg =
          orderResponse.errorMessage ||
          (orderResponse as any).error ||
          'Failed to get swap order'
        setError(errMsg)
        setLoading(false)
        setTxStatus({ status: 'failed', error: errMsg })
        return
      }

      if (!orderResponse.transaction) {
        const errMsg =
          orderResponse.errorMessage || 'No transaction returned from Jupiter'
        setError(errMsg)
        setLoading(false)
        setTxStatus({ status: 'failed', error: errMsg })
        return
      }

      // Step 2: Deserialize and sign the transaction
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(orderResponse.transaction, 'base64')
      )

      const signer = await primaryWallet.getSigner()
      const signedTransaction = await signer.signTransaction(transaction)

      setTxStatus({ status: 'sent' })

      // Step 3: Execute via Jupiter Ultra
      const serializedTx = Buffer.from(
        signedTransaction.serialize()
      ).toString('base64')

      const executeResponse: UltraExecuteResponse = await fetch(
        '/api/jupiter/execute',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signedTransaction: serializedTx,
            requestId: orderResponse.requestId,
          }),
        }
      ).then((res) => res.json())

      // Step 4: Handle result
      if (executeResponse.status === 'Success' && executeResponse.signature) {
        setTxSignature(executeResponse.signature)
        setTxStatus({
          status: 'confirmed',
          signature: executeResponse.signature,
        })
        setIsFullyConfirmed(true)

        // Update quoteResponse with actual amounts from execution
        setQuoteResponse(orderResponse)

        // Create content node for the trade
        await createContentNode({
          signature: executeResponse.signature,
          inputMint,
          outputMint,
          inputAmount,
          expectedOutput,
          priceImpact,
          slippageBps: orderResponse.slippageBps,
          priorityLevel: 'low',
          inputDecimals: inputDecimals || 6,
          outputDecimals: outputDecimals || 6,
          walletAddress,
          sourceWallet,
          sourceTransactionId,
          swapUsdValue: orderResponse.swapUsdValue?.toString(),
          usdcFeeAmount: orderResponse.swapUsdValue
            ? (
                Number(orderResponse.swapUsdValue) *
                (PLATFORM_FEE_BPS / 10000)
              ).toString()
            : '0',
          route: (() => {
            const path = pathname
            if (path.includes('/trenches')) return 'trenches'
            if (path.includes('/signals')) return 'signals'
            if (path.includes('/trade')) return 'trade'
            return 'home'
          })(),
        })
      } else {
        const errMsg = executeResponse.error || 'Swap execution failed'
        setError(errMsg)
        setTxStatus({ status: 'failed', error: errMsg })

        // Still set signature if available (for failed tx lookup)
        if (executeResponse.signature) {
          setTxSignature(executeResponse.signature)
        }
      }
    } catch (error: any) {
      const errMsg = error.message || 'Transaction failed'
      setError(errMsg)
      setTxStatus({ status: 'failed', error: errMsg })
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh quote every 15 seconds
  useEffect(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }

    if (
      Number(inputAmount) !== 0 &&
      inputAmount &&
      inputMint &&
      outputMint &&
      !isFullyConfirmed
    ) {
      refreshIntervalRef.current = setInterval(() => {
        if (!isQuoteRefreshing && !loading) fetchQuote()
      }, 15000)
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputAmount,
    inputMint,
    outputMint,
    loading,
    isFullyConfirmed,
    isQuoteRefreshing,
  ])

  // Fetch quote when inputs change — also re-fires when decimals become available
  // (decimals start as undefined while token info loads; quote can't be computed without them)
  useEffect(() => {
    if (
      Number(inputAmount) !== 0 &&
      inputAmount &&
      inputMint &&
      outputMint &&
      !isQuoteRefreshing &&
      !loading
    ) {
      fetchQuote()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAmount, inputMint, outputMint, inputDecimals, outputDecimals])

  return {
    loading,
    error,
    txSignature,
    quoteResponse,
    expectedOutput,
    priceImpact,
    isFullyConfirmed,
    isQuoteRefreshing,
    handleSwap,
    refreshQuote,
    txStatus,
    txError: txStatus?.error || null,
    resetQuoteState,
  }
}
