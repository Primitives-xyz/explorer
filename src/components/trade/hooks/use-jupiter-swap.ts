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
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useToastContent } from './drift/use-toast-content'
import { useCreateTradeContentNode } from './use-create-trade-content'

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
}: UseJupiterSwapParams) {
  const t = useTranslations()
  const { ERRORS, LOADINGS, SUCCESS } = useToastContent()
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
      toast.error(
        ERRORS.WALLET_CONNETION_ERR.title,
        ERRORS.WALLET_CONNETION_ERR.content
      )
      setLoading(false)
      return
    }

    if (platformFeeBps === 1 && !ssePrice) {
      toast.error(
        ERRORS.FEE_CALCULATION_ERR.title,
        ERRORS.FEE_CALCULATION_ERR.content
      )
      setLoading(false)
      return
    }

    if (!quoteResponse) {
      toast.error(
        ERRORS.JUP_QUOTE_API_ERR.title,
        ERRORS.JUP_QUOTE_API_ERR.content
      )
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
      toast.error(
        ERRORS.FEE_CALCULATION_ERR.title,
        ERRORS.FEE_CALCULATION_ERR.content
      )
      currentSseFeeAmount = '0'
      setLoading(false)
      setSseFeeAmount('0')
      return
    }

    const preparingToastId = toast.loading(
      LOADINGS.PREPARING_LOADING.title,
      LOADINGS.PREPARING_LOADING.content
    )

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
          toast.error(ERRORS.FEE_CALCULATION_ERR.title, {
            description: 'Failed to determine SSE fee account.',
          })
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
        toast.dismiss(preparingToastId)
        toast.error(
          ERRORS.JUP_SWAP_API_ERR.title,
          ERRORS.JUP_SWAP_API_ERR.content
        )
        return
      }

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(response.transaction, 'base64')
      )

      toast.dismiss(preparingToastId)

      const sendingToastId = toast.loading(
        LOADINGS.SEND_LOADING.title,
        LOADINGS.SEND_LOADING.content
      )

      const signer = await primaryWallet.getSigner()
      const txid = await signer.signAndSendTransaction(transaction)
      setTxSignature(txid.signature)

      toast.dismiss(sendingToastId)
      const confirmToastId = toast.loading(
        LOADINGS.CONFIRM_LOADING.title,
        LOADINGS.CONFIRM_LOADING.content
      )

      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
      const tx = await connection.confirmTransaction(
        {
          signature: txid.signature,
          ...(await connection.getLatestBlockhash()),
        },
        'confirmed'
      )

      await createContentNode({
        signature: txid.signature,
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
      })

      if (tx.value.err) {
        toast.dismiss(confirmToastId)
        toast.error(ERRORS.TX_FAILED_ERR.title, ERRORS.TX_FAILED_ERR.content)
      } else {
        toast.dismiss(confirmToastId)
        toast.success(SUCCESS.TX_SUCCESS.title, SUCCESS.TX_SUCCESS.content)
        setIsFullyConfirmed(true)
      }
    } catch (error) {
      toast.dismiss()
      toast.error(ERRORS.TX_FAILED_ERR.title, ERRORS.TX_FAILED_ERR.content)
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
