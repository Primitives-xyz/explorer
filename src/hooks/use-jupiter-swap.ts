import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import {
  DEFAULT_PRIORITY_LEVEL,
  DEFAULT_SLIPPAGE_BPS,
  PLATFORM_FEE_ACCOUNT,
  PLATFORM_FEE_BPS,
  SSE_TOKEN_MINT,
} from '@/constants/jupiter'
import { useToast } from '@/hooks/use-toast'
import type { PriorityLevel, QuoteResponse } from '@/types/jupiter'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { useCreateContentNode } from './use-create-content-node'
import { useSSEPrice } from './use-sse-price'
import { useTokenInfo } from './use-token-info'

interface UseJupiterSwapParams {
  inputMint: string
  outputMint: string
  inputAmount: string
  inputDecimals: number
  sourceWallet?: string
  platformFeeBps?: number
}

export function useJupiterSwap({
  inputMint,
  outputMint,
  inputAmount,
  inputDecimals,
  sourceWallet,
  platformFeeBps = PLATFORM_FEE_BPS,
}: UseJupiterSwapParams) {
  const { toast } = useToast()
  const { createContentNode } = useCreateContentNode()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txSignature, setTxSignature] = useState('')
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>(
    DEFAULT_PRIORITY_LEVEL
  )
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(null)
  const [expectedOutput, setExpectedOutput] = useState<string>('')
  const [priceImpact, setPriceImpact] = useState<string>('')
  const [slippageBps, setSlippageBps] = useState<number | 'auto'>(
    DEFAULT_SLIPPAGE_BPS
  )
  const [showTradeLink, setShowTradeLink] = useState(false)
  const [isFullyConfirmed, setIsFullyConfirmed] = useState(false)
  const [isQuoteRefreshing, setIsQuoteRefreshing] = useState(false)
  const { ssePrice } = useSSEPrice()
  const [sseFeeAmount, setSseFeeAmount] = useState<string>('0')
  const outputTokenInfo = useTokenInfo(outputMint)
  const resetQuoteState = useCallback(() => {
    setQuoteResponse(null)
    setExpectedOutput('')
    setPriceImpact('')
    setError('')
    setTxSignature('')
    setShowTradeLink(false)
    setIsFullyConfirmed(false)
    setIsQuoteRefreshing(false)
  }, [])

  const t = useTranslations()

  const checkAndCreateTokenAccount = async (
    mintAddress: string,
    walletAddress: string
  ) => {
    try {
      const response = await fetch(
        `/api/tokens/account?mintAddress=${mintAddress}&walletAddress=${walletAddress}`
      )
      const data = await response.json()

      if (data.status === 'requires_creation') {
        toast({
          title: t('trade.creating_token_account'),
          description: t('trade.setting_up_required_token_account_for_fees'),
          variant: 'pending',
          duration: 5000,
        })

        // Create the token account
        const transaction = VersionedTransaction.deserialize(
          Buffer.from(data.transaction, 'base64')
        )

        if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
          throw new Error(t('error.wallet_not_connected'))
        }

        const signer = await primaryWallet.getSigner()
        const txid = await signer.signAndSendTransaction(transaction)

        // Wait for confirmation
        const connection = await primaryWallet.getConnection()
        await connection.confirmTransaction({
          signature: txid.signature,
          ...(await connection.getLatestBlockhash()),
        })

        toast({
          title: t('trade.token_account_created'),
          description: t(
            'trade.successfully_set_up_the_required_token_account'
          ),
          variant: 'success',
          duration: 3000,
        })
      }

      return data.tokenAccount
    } catch (err) {
      console.error(t('error.error_checking_token_account'), err)
      toast({
        title: t('error.token_account_error'),
        description: t('error.failed_to_set_up_required_token_account'),
        variant: 'error',
        duration: 5000,
      })
      throw err
    }
  }

  const fetchQuote = async () => {
    if (!inputAmount || !inputMint || !outputMint) {
      resetQuoteState()
      return
    }

    try {
      // Set refreshing state instead of loading if we already have a quote
      if (quoteResponse) {
        setIsQuoteRefreshing(true)
      } else {
        setLoading(true)
      }

      // Use input decimals for amount calculation
      const adjustedAmount = Math.floor(
        Number(inputAmount) * Math.pow(10, inputDecimals)
      )

      const QUOTE_URL =
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}` +
        `&outputMint=${outputMint}&amount=${adjustedAmount}` +
        `&slippageBps=${
          slippageBps === 'auto'
            ? calculateAutoSlippage(priceImpact)
            : slippageBps
        }` +
        // Always add a 1 bps platform fee, even when using SSE fees
        `&platformFeeBps=${
          platformFeeBps !== 0 ? platformFeeBps ?? PLATFORM_FEE_BPS : 1
        }` +
        `&feeAccount=${PLATFORM_FEE_ACCOUNT}`

      const response = await fetch(QUOTE_URL).then((res) => res.json())

      setQuoteResponse(response)
      // Use the output token's decimals for formatting
      const outputDecimals = outputTokenInfo.decimals ?? 9
      setExpectedOutput(
        (Number(response.outAmount) / Math.pow(10, outputDecimals)).toString()
      )
      setPriceImpact(response.priceImpactPct)

      // After getting price impact, if using auto slippage, update the quote with calculated slippage
      if (slippageBps === 'auto' && response.priceImpactPct) {
        const calculatedSlippage = calculateAutoSlippage(
          response.priceImpactPct
        )
        // Only fetch again if the calculated slippage is different from default
        if (calculatedSlippage !== DEFAULT_SLIPPAGE_BPS) {
          const RECALC_QUOTE_URL =
            `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}` +
            `&outputMint=${outputMint}&amount=${adjustedAmount}` +
            `&slippageBps=${calculatedSlippage}` +
            `&platformFeeBps=${
              platformFeeBps !== 0 ? platformFeeBps ?? PLATFORM_FEE_BPS : 1
            }` +
            `&feeAccount=${PLATFORM_FEE_ACCOUNT}`

          const recalcResponse = await fetch(RECALC_QUOTE_URL).then((res) =>
            res.json()
          )
          setQuoteResponse(recalcResponse)
          setExpectedOutput(
            (
              Number(recalcResponse.outAmount) / Math.pow(10, outputDecimals)
            ).toString()
          )
          setPriceImpact(recalcResponse.priceImpactPct)
        }
      }

      // Calculate SSE fee amount if using SSE for fees
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
      console.error(t('error.failed_to_fetch_quote'), err)
      setError(t('error.failed_to_fetch_quote'))
      setSseFeeAmount('0')
    } finally {
      setLoading(false)
      setIsQuoteRefreshing(false)
    }
  }

  const handleSwap = async () => {
    if (!primaryWallet || !walletAddress) {
      setError(t('error.wallet_not_connected'))
      return
    }

    if (platformFeeBps === 1 && !ssePrice) {
      setError(t('error.unable_to_calculate_sse_fee'))
      return
    }

    setLoading(true)
    setIsFullyConfirmed(false)
    try {
      toast({
        title: t('trade.preparing_swap'),
        description:
          platformFeeBps === 1
            ? t('trade.setting_up_sse_fee_accounts')
            : t('trade.setting_up_fee_accounts'),
        variant: 'pending',
        duration: 2000,
      })

      // Run token account checks and quote fetching in parallel
      const [outputFeeAta, sseFeeAta, quoteResponse] = await Promise.all([
        // Always check for output token fee ATA since we're always using a platform fee (1 bps for SSE)
        checkAndCreateTokenAccount(outputMint, PLATFORM_FEE_ACCOUNT),
        // Check and create SSE token account for platform fees if using SSE for fees
        platformFeeBps === 1
          ? checkAndCreateTokenAccount(SSE_TOKEN_MINT, PLATFORM_FEE_ACCOUNT)
          : Promise.resolve(null),
        // Fetch quote in parallel
        (async () => {
          const multiplier = Math.pow(10, inputDecimals)
          const adjustedAmount = Number(inputAmount) * multiplier

          // For auto slippage, start with default slippage
          const initialSlippage =
            slippageBps === 'auto' ? DEFAULT_SLIPPAGE_BPS : slippageBps

          const QUOTE_2_URL: string =
            `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}` +
            `&outputMint=${outputMint}&amount=${adjustedAmount}` +
            `&slippageBps=${initialSlippage}` +
            // Always add a 1 bps platform fee, even when using SSE fees
            `&platformFeeBps=${
              platformFeeBps !== 0 ? platformFeeBps ?? PLATFORM_FEE_BPS : 1
            }` +
            `&feeAccount=${PLATFORM_FEE_ACCOUNT}`

          const response: QuoteResponse = await fetch(QUOTE_2_URL).then((res) =>
            res.json()
          )

          // If auto slippage is enabled, recalculate with the actual price impact
          if (slippageBps === 'auto' && response.priceImpactPct) {
            const calculatedSlippage = calculateAutoSlippage(
              response.priceImpactPct
            )
            if (calculatedSlippage !== initialSlippage) {
              const RECALC_URL: string =
                `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}` +
                `&outputMint=${outputMint}&amount=${adjustedAmount}` +
                `&slippageBps=${calculatedSlippage}` +
                `&platformFeeBps=${
                  platformFeeBps !== 0 ? platformFeeBps ?? PLATFORM_FEE_BPS : 1
                }` +
                `&feeAccount=${PLATFORM_FEE_ACCOUNT}`

              return await fetch(RECALC_URL).then((res) => res.json())
            }
          }

          return response
        })(),
      ])

      toast({
        title: t('trade.fee_accounts_ready'),
        description:
          platformFeeBps === 0
            ? t('trade.sse_fee_accounts_are_set_up_and_ready')
            : t('trade.fee_accounts_are_set_up_and_ready'),
        variant: 'success',
        duration: 2000,
      })

      // Calculate SSE fee amount if using SSE for fees
      let currentSseFeeAmount = '0'
      if (platformFeeBps === 1 && ssePrice && quoteResponse) {
        try {
          // Get the input amount in USDC terms using the quote's USD value
          const swapValueUSDC = Number(quoteResponse.swapUsdValue ?? '0')
          const inputAmountUSDC = swapValueUSDC || 0

          // Calculate fees based on USD value
          const platformFeeUSDC = inputAmountUSDC * (PLATFORM_FEE_BPS / 10000) // 1% of input
          const halfFeeUSDC = platformFeeUSDC / 2 // 0.5% for SSE

          // Convert USDC fee to SSE using the current SSE/USDC price
          // If 1 SSE = 0.00782 USDC, then to get SSE amount we divide USDC by 0.00782
          const sseAmount = halfFeeUSDC / ssePrice

          // Convert to base units (6 decimals)
          currentSseFeeAmount = Math.floor(
            sseAmount * Math.pow(10, 6)
          ).toString()
          setSseFeeAmount(currentSseFeeAmount)
        } catch (err) {
          console.error(t('error.error_calculating_sse_fee'), err)
          currentSseFeeAmount = '0'
          setSseFeeAmount('0')
        }
      }

      toast({
        title: t('trade.building_transaction'),
        description: t('trade.preparing_your_swap_transaction'),
        variant: 'pending',
        duration: 2000,
      })

      // Get transaction from our API
      const response = await fetch('/api/jupiter/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          walletAddress,
          feeTokenAccount: outputFeeAta,
          mintAddress: outputMint,
          sseTokenAccount: platformFeeBps === 1 ? sseFeeAta : undefined,
          sseFeeAmount: platformFeeBps === 1 ? currentSseFeeAmount : undefined,
        }),
      }).then((res) => res.json())

      if (response.error) {
        throw new Error(response.error)
      }

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(response.transaction, 'base64')
      )

      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        return
      }

      toast({
        title: t('trade.sending_transaction'),
        description: t('trade.please_approve_the_transaction_in_your_wallet'),
        variant: 'pending',
        duration: 5000,
      })

      const signer = await primaryWallet.getSigner()
      const txid = await signer.signAndSendTransaction(transaction)

      setTxSignature(txid.signature)

      // Create a persistent toast for confirmation with a very long duration
      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000, // Very long duration to ensure it stays visible
      })

      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
      const tx = await connection.confirmTransaction({
        signature: txid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      // Dismiss the confirmation toast before showing the result
      confirmToast.dismiss()

      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_swap_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
        setError(t('error.transaction_failed_please_try_again'))
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_swap_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })
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
              : slippageBps,
          sourceWallet,
          priorityLevel,
          walletAddress,
          inputDecimals,
          usdcFeeAmount: quoteResponse.swapUsdValue
            ? (
                Number(quoteResponse.swapUsdValue) *
                (platformFeeBps === 1
                  ? PLATFORM_FEE_BPS / 20000
                  : PLATFORM_FEE_BPS / 10000)
              ).toString()
            : '0',
        })
        setShowTradeLink(true)
        setIsFullyConfirmed(true)
      }
    } catch (err) {
      console.error(t('error.swap_failed'), err)
      toast({
        title: t('error.swap_failed'),
        description: t('error.the_swap_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
      setError(t('error.the_swap_transaction_failed_please_try_again'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuote()
  }, [
    inputAmount,
    inputMint,
    outputMint,
    slippageBps,
    platformFeeBps,
    ssePrice,
  ])

  return {
    loading,
    error,
    txSignature,
    priorityLevel,
    setPriorityLevel,
    quoteResponse,
    expectedOutput,
    priceImpact,
    slippageBps,
    setSlippageBps,
    showTradeLink,
    isFullyConfirmed,
    handleSwap,
    resetQuoteState,
    isQuoteRefreshing,
    sseFeeAmount,
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
