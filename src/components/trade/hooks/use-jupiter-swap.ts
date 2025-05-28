'use client'

import { useSSEPrice } from '@/components/trade/hooks/use-sse-price'
import {
  DEFAULT_SLIPPAGE_BPS,
  DEFAULT_SLIPPAGE_VALUE,
  PLATFORM_FEE_ACCOUNT,
  PLATFORM_FEE_BPS,
  SSE_TOKEN_MINT,
} from '@/utils/constants'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useCreateTradeContentNode } from './use-create-trade-content'
import { useJupiterTransaction } from './use-jupiter-transaction'
import { useJupiterTransactionSSE } from './use-jupiter-transaction-sse'

interface UseJupiterSwapParams {
  inputMint: string
  outputMint: string
  inputAmount: string
  inputDecimals?: number
  outputDecimals?: number
  platformFeeBps?: number
  primaryWallet: any
  walletAddress: string
  swapMode?: string
  useSSE?: boolean // Enable Server-Sent Events for real-time updates
}

interface QuoteResponse {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee?: {
    amount: string
    feeBps: number
  }
  priceImpactPct: string
  routePlan: {
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
  }[]
  contextSlot: number
  timeTaken: number
  swapUsdValue?: string
  simplerRouteUsed?: boolean
}

export function useJupiterSwap({
  inputMint,
  outputMint,
  inputAmount,
  inputDecimals,
  outputDecimals,
  platformFeeBps = PLATFORM_FEE_BPS,
  primaryWallet,
  walletAddress,
  swapMode = 'ExactIn',
  useSSE = true, // Default to using SSE for better performance
}: UseJupiterSwapParams) {
  const t = useTranslations()
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(null)
  const [expectedOutput, setExpectedOutput] = useState<string>('')
  const [txSignature, setTxSignature] = useState<string>('')
  const [isFullyConfirmed, setIsFullyConfirmed] = useState<boolean>(false)
  const [isQuoteRefreshing, setIsQuoteRefreshing] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [slippageBps, setSlippageBps] = useState<number | string>(
    DEFAULT_SLIPPAGE_BPS
  )
  const { createContentNode } = useCreateTradeContentNode()
  const [priceImpact, setPriceImpact] = useState<string>('')
  const [sseFeeAmount, setSseFeeAmount] = useState<string>('0')
  const [error, setError] = useState<string | null>(null)
  const { ssePrice } = useSSEPrice()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  // Store the last transaction for retry
  const lastTransactionRef = useRef<{
    transaction: VersionedTransaction
    metadata: any
  } | null>(null)

  // Common callbacks for both transaction hooks
  const onStatusUpdate = useCallback((status: any) => {
    // Just update the signature when sent
    if (status.status === 'sent' && status.signature) {
      setTxSignature(status.signature)
    } else if (status.status === 'confirmed' && status.signature) {
      setIsFullyConfirmed(true)
    }
  }, [])

  const onSuccess = useCallback(
    async (signature: string) => {
      // Create content node on success
      await createContentNode({
        signature,
        inputMint,
        outputMint,
        inputAmount,
        expectedOutput,
        priceImpact,
        slippageBps:
          slippageBps === 'auto'
            ? calculateAutoSlippage(priceImpact)
            : Number(slippageBps),
        priorityLevel: 'low',
        inputDecimals: inputDecimals || 6,
        walletAddress,
        usdcFeeAmount: quoteResponse?.swapUsdValue
          ? (
              Number(quoteResponse.swapUsdValue) *
              (platformFeeBps === 1
                ? PLATFORM_FEE_BPS / 20000
                : PLATFORM_FEE_BPS / 10000)
            ).toString()
          : '0',
        route: (() => {
          const path = pathname
          if (path.includes('/trenches')) return 'trenches'
          if (path.includes('/trade')) return 'trade'
          return 'home'
        })(),
      })
    },
    [
      createContentNode,
      inputMint,
      outputMint,
      inputAmount,
      expectedOutput,
      priceImpact,
      slippageBps,
      inputDecimals,
      walletAddress,
      quoteResponse?.swapUsdValue,
      platformFeeBps,
      pathname,
    ]
  )

  // Initialize the regular transaction hook
  const regularTxHook = useJupiterTransaction({
    onStatusUpdate,
    onSuccess,
  })

  // Initialize the SSE transaction hook
  const sseTxHook = useJupiterTransactionSSE({
    onStatusUpdate,
    onSuccess,
  })

  // Select which hook to use based on useSSE flag
  const {
    sendAndConfirmTransaction,
    status: txStatus,
    error: txError,
  } = useSSE ? sseTxHook : regularTxHook

  const resetQuoteState = useCallback(() => {
    setQuoteResponse(null)
    setExpectedOutput('')
    setPriceImpact('')
    setTxSignature('')
    setError(null)
    setTxSignature('')
    setIsFullyConfirmed(false)
    setIsQuoteRefreshing(false)
    setSseFeeAmount('0')
  }, [])

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
      const QUOTE_URL = `
        https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inputAmountInDecimals}&slippageBps=${DEFAULT_SLIPPAGE_VALUE}&platformFeeBps=${
        platformFeeBps !== 0 ? platformFeeBps ?? PLATFORM_FEE_BPS : 1
      }&feeAccount=${PLATFORM_FEE_ACCOUNT}&swapMode=${swapMode}
      `
      const response = await fetch(QUOTE_URL).then((res) => res.json())
      if (swapMode == 'ExactIn') {
        setExpectedOutput(
          (Number(response.outAmount) / Math.pow(10, outputDecimals)).toString()
        )
      } else {
        setExpectedOutput(
          (Number(response.inAmount) / Math.pow(10, outputDecimals)).toString()
        )
      }
      setPriceImpact(response.priceImpactPct)
      setQuoteResponse(response)

      if (platformFeeBps === 1 && ssePrice) {
        try {
          // Get the input amount in USDC terms using the quote's USD value
          const swapValueUSDC = Number(response.swapUsdValue ?? '0')
          const inputAmountUSDC = swapValueUSDC || 0

          // Calculate fees based on USD value
          const platformFeeUSDC = inputAmountUSDC * (PLATFORM_FEE_BPS / 10000) // 1% of input
          const halfFeeUSDC = platformFeeUSDC / 2 // 0.5% for SSE

          // Convert USDC fee to SSE using the current SSE/USDC price
          // If 1 SSE = 0.00782 USDC, then to get SSE amount we divide USDC by 0.00782
          const sseAmount = halfFeeUSDC / ssePrice

          // Convert to base units (6 decimals)
          const currentSseFeeAmount = Math.floor(
            sseAmount * Math.pow(10, 6)
          ).toString()
          setSseFeeAmount(currentSseFeeAmount)
        } catch (err) {
          console.error(t('error.error_calculating_sse_fee_during_quote'), err)
          setSseFeeAmount('0')
        }
      } else {
        setSseFeeAmount('0')
      }

      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to output amount')
      setSseFeeAmount('0')
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
    platformFeeBps,
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

    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError('Wallet not connected')
      setLoading(false)
      return
    }

    if (platformFeeBps === 1 && !ssePrice) {
      setError('Unable to calculate SSE fee')
      setLoading(false)
      return
    }

    if (!quoteResponse) {
      setError('No quote available')
      setLoading(false)
      return
    }

    let currentSseFeeAmount = '0'
    try {
      if (platformFeeBps === 1 && ssePrice) {
        const swapValueUSDC = Number(quoteResponse.swapUsdValue ?? '0')
        const inputAmountUSDC = swapValueUSDC || 0

        // Calculate fees based on USD value
        const platformFeeUSDC = inputAmountUSDC * (PLATFORM_FEE_BPS / 10000) // 1% of input
        const halfFeeUSDC = platformFeeUSDC / 2 // 0.5% for SSE

        // Convert USDC fee to SSE using the current SSE/USDC price
        // If 1 SSE = 0.00782 USDC, then to get SSE amount we divide USDC by 0.00782
        const sseAmount = halfFeeUSDC / ssePrice

        // Convert to base units (6 decimals)
        currentSseFeeAmount = Math.floor(sseAmount * Math.pow(10, 6)).toString()
        setSseFeeAmount(currentSseFeeAmount)
      }
    } catch (error) {
      setError('Failed to calculate fees')
      currentSseFeeAmount = '0'
      setLoading(false)
      setSseFeeAmount('0')
      return
    }

    try {
      // Derive SSE Fee Destination ATA if needed
      let sseFeeDestinationAtaString: string | undefined = undefined
      if (platformFeeBps === 1) {
        try {
          const sseFeeDestinationAta = getAssociatedTokenAddressSync(
            new PublicKey(SSE_TOKEN_MINT),
            new PublicKey(PLATFORM_FEE_ACCOUNT)
          )
          sseFeeDestinationAtaString = sseFeeDestinationAta.toBase58()
        } catch (e) {
          console.error('Failed to derive SSE fee destination ATA:', e)
          setError('Failed to determine SSE fee account')
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/jupiter/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          walletAddress,
          mintAddress: outputMint,
          sseFeeAmount: platformFeeBps === 1 ? currentSseFeeAmount : undefined,
          sseTokenAccount: sseFeeDestinationAtaString,
          slippageMode: slippageBps === 'auto' ? 'auto' : 'fixed',
          slippageBps:
            slippageBps === 'auto'
              ? calculateAutoSlippage(priceImpact)
              : slippageBps,
          swapMode,
        }),
      }).then((res) => res.json())

      if (response.error) {
        setError('Failed to prepare swap transaction')
        setLoading(false)
        return
      }

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(response.transaction, 'base64')
      )

      // Sign the transaction
      const signer = await primaryWallet.getSigner()
      const signedTransaction = await signer.signTransaction(transaction)

      // Prepare metadata for the transaction
      const metadata = {
        inputMint,
        outputMint,
        inputAmount,
        expectedOutput,
        priceImpact,
        slippageBps:
          slippageBps === 'auto'
            ? calculateAutoSlippage(priceImpact).toString()
            : slippageBps.toString(),
        usdcFeeAmount: quoteResponse.swapUsdValue
          ? (
              Number(quoteResponse.swapUsdValue) *
              (platformFeeBps === 1
                ? PLATFORM_FEE_BPS / 20000
                : PLATFORM_FEE_BPS / 10000)
            ).toString()
          : '0',
        route: (() => {
          const path = pathname
          if (path.includes('/trenches')) return 'trenches'
          if (path.includes('/trade')) return 'trade'
          return 'home'
        })(),
      }

      // Store for retry
      lastTransactionRef.current = {
        transaction: signedTransaction,
        metadata,
      }

      // Send and confirm using the new system
      await sendAndConfirmTransaction(
        signedTransaction,
        walletAddress,
        metadata
      )
    } catch (error: any) {
      setError(error.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

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
        if (!isQuoteRefreshing && !loading) fetchQuote() // Use a flag to prevent multiple concurrent refreshes
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

  useEffect(() => {
    // Only fetch quote if we have the necessary inputs and not already refreshing
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
  }, [
    inputAmount,
    inputMint,
    outputMint,
    slippageBps,
    platformFeeBps,
    ssePrice,
    // Remove fetchQuote from dependencies to prevent circular updates
  ])

  return {
    loading,
    error,
    txSignature,
    quoteResponse,
    expectedOutput,
    priceImpact,
    isFullyConfirmed,
    isQuoteRefreshing,
    sseFeeAmount,
    handleSwap,
    refreshQuote,
    txStatus,
    txError,
    resetQuoteState,
  }
}

function calculateAutoSlippage(priceImpactPct: string): number {
  const impact = Math.abs(parseFloat(priceImpactPct))

  // Default to 0.5% (50 bps) if no price impact or invalid
  if (!impact || isNaN(impact)) return 50

  // Scale slippage based on price impact
  if (impact <= 0.1) return 50 // 0.5% slippage for very low impact
  if (impact <= 0.5) return 100 // 1% slippage for low impact
  if (impact <= 1.0) return 200 // 2% slippage for medium impact
  if (impact <= 2.0) return 500 // 5% slippage for high impact
  if (impact <= 5.0) return 1000 // 10% slippage for very high impact
  return 1500 // 15% slippage for extreme impact
}
