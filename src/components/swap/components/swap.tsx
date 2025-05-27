'use client'

import { TokenSearch } from '@/components/swap/components/swap-dialog/token-search'
import { BottomSwap } from '@/components/swap/components/swap-elements/bottom-swap'
import { CenterButtonSwap } from '@/components/swap/components/swap-elements/center-button-swap'
import { TopSwap } from '@/components/swap/components/swap-elements/top-swap'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { useJupiterSwap } from '@/components/trade/hooks/use-jupiter-swap'
import { useTokenBalance } from '@/components/trade/hooks/use-token-balance'
import { SOL_MINT, SSE_MINT } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  formatLargeNumber,
  formatRawAmount,
  formatUsdValue,
} from '@/utils/utils'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { useSwapStore } from '../stores/use-swap-store'
import { ESwapMode } from '../swap.models'
import { TransactionLink } from './transaction-link'
import { TransactionStatus } from './transaction-status'
import { useTrade } from '@/components/trade/context/trade-context'

const isStable = (token: string) => {
  const STABLE_TOKENS = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // usdc
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // usdt
    SOL_MINT, // sol
  ]
  return STABLE_TOKENS.includes(token)
}

const getTargetToken = (tokenA: string, tokenB: string) => {
  const aStable = isStable(tokenA)
  const bStable = isStable(tokenB)

  // Rule 1: If only one is stable, return the other
  if (aStable && !bStable) return tokenB
  if (!aStable && bStable) return tokenA

  // Rule 2: If both are stable, return tokenB
  if (aStable && bStable) return tokenB

  // Rule 3: Both are alt/meme, return the buyingToken
  return tokenB
}

const validateAmount = (value: string, decimals: number = 6): boolean => {
  if (value === '') return true

  // Check if the value is a valid number
  const numericValue = Number(value)
  if (isNaN(numericValue)) {
    return false
  }

  // Check if the value is positive
  if (numericValue <= 0) {
    return false
  }

  // Check if the value has too many decimal places
  const decimalParts = value.split('.')
  if (
    decimalParts.length > 1 &&
    decimalParts[1]?.length &&
    decimalParts[1]?.length > decimals
  ) {
    return false
  }

  return true
}

interface Props {
  autoFocus?: boolean
}

export function Swap({ autoFocus }: Props) {
  const t = useTranslations()
  const { setTokenMint } = useTrade()
  // Centralized swap state from store
  const {
    inputs: { inputMint: inputTokenMint, outputMint: outputTokenMint },
    swapMode,
    inAmount,
    outAmount,
    setInputs,
    setSwapMode,
    setInAmount,
    setOutAmount,
  } = useSwapStore()

  const [useSSEForFees, setUseSSEForFeesState] = useState(false)
  const [showInputTokenSearch, setShowInputTokenSearch] = useState(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] = useState(false)

  const {
    symbol: inputTokenSymbol,
    decimals: inputTokenDecimals,
    image: inputTokenImageUri,
  } = useTokenInfo(inputTokenMint)
  const {
    symbol: outputTokenSymbol,
    decimals: outputTokenDecimals,
    image: outputTokenImageUri,
  } = useTokenInfo(outputTokenMint)

  const {
    isLoggedIn,
    sdkHasLoaded,
    walletAddress,
    primaryWallet,
    setShowAuthFlow,
  } = useCurrentWallet()
  const { balance: inputBalance, rawBalance: inputRawBalance } =
    useTokenBalance(walletAddress, inputTokenMint)
  const { price: inputTokenUsdPrice, loading: inputTokenUsdPriceLoading } =
    useTokenUSDCPrice({
      tokenMint: inputTokenMint,
      decimals: inputTokenDecimals,
    })
  const { price: outputTokenUsdPrice, loading: outputTokenUsdPriceLoading } =
    useTokenUSDCPrice({
      tokenMint: outputTokenMint,
      decimals: outputTokenDecimals,
    })
  const { balance: sseBalance, rawBalance: sseRawBalance } = useTokenBalance(
    walletAddress,
    SSE_MINT
  )

  const {
    loading,
    quoteResponse,
    expectedOutput,
    isQuoteRefreshing,
    sseFeeAmount,
    handleSwap,
    txStatus,
    error: swapError,
    txSignature,
    isFullyConfirmed,
    resetQuoteState,
    refreshQuote,
  } = useJupiterSwap({
    inputMint: inputTokenMint,
    outputMint: outputTokenMint,
    inputAmount: swapMode === ESwapMode.EXACT_IN ? inAmount : outAmount,
    inputDecimals:
      swapMode === ESwapMode.EXACT_IN
        ? inputTokenDecimals
        : outputTokenDecimals,
    outputDecimals:
      swapMode === ESwapMode.EXACT_OUT
        ? inputTokenDecimals
        : outputTokenDecimals,
    platformFeeBps: useSSEForFees ? 1 : undefined,
    primaryWallet: primaryWallet,
    walletAddress: walletAddress,
    swapMode: swapMode,
  })

  const displayInAmount = useMemo(() => {
    // When refreshing quote in EXACT_OUT mode, keep showing the previous value
    if (
      isQuoteRefreshing &&
      swapMode === ESwapMode.EXACT_OUT &&
      inAmount !== ''
    ) {
      return inAmount
    }
    if (inAmount == '') {
      return ''
    } else {
      if (swapMode === ESwapMode.EXACT_IN) {
        return inAmount
      } else {
        return formatLargeNumber(parseFloat(inAmount), inputTokenDecimals)
      }
    }
  }, [inAmount, inputTokenDecimals, isQuoteRefreshing, swapMode])

  const displayOutAmount = useMemo(() => {
    if (
      isQuoteRefreshing &&
      swapMode === ESwapMode.EXACT_IN &&
      outAmount !== ''
    ) {
      return outAmount
    }
    if (outAmount == '') {
      return ''
    } else {
      if (swapMode === ESwapMode.EXACT_OUT) {
        return outAmount
      } else {
        return formatLargeNumber(parseFloat(outAmount), outputTokenDecimals)
      }
    }
  }, [isQuoteRefreshing, swapMode, outAmount, outputTokenDecimals])

  const displayInAmountInUsd = useMemo(() => {
    if (!inputTokenUsdPrice || isNaN(parseFloat(inAmount))) {
      return '...'
    }
    return formatUsdValue(inputTokenUsdPrice * parseFloat(inAmount))
  }, [inputTokenUsdPrice, inAmount])

  const displayOutAmountInUsd = useMemo(() => {
    if (!outputTokenUsdPrice || isNaN(parseFloat(outAmount))) {
      return '...'
    }
    return formatUsdValue(outputTokenUsdPrice * parseFloat(outAmount))
  }, [outputTokenUsdPrice, outAmount])

  const displaySseFeeAmount = useMemo(() => {
    const fee = (Number(sseFeeAmount) / Math.pow(10, 6)).toString()

    return formatLargeNumber(parseFloat(fee), 6)
  }, [sseFeeAmount])

  const sseFeeRaw = useMemo(() => {
    return BigInt(Math.floor(Number(sseFeeAmount)))
  }, [sseFeeAmount])

  const notEnoughSSE = useSSEForFees && sseRawBalance < sseFeeRaw

  const inputAmountRaw = useMemo(() => {
    if (!inAmount || isNaN(Number(inAmount)) || !inputTokenDecimals) return 0n
    return BigInt(
      Math.floor(Number(inAmount) * Math.pow(10, inputTokenDecimals))
    )
  }, [inAmount, inputTokenDecimals])

  const notEnoughInput = inputAmountRaw > inputRawBalance

  const handleInputAmountByPercentage = (percent: number) => {
    if (
      !inputBalance ||
      typeof inputRawBalance !== 'bigint' ||
      !inputTokenDecimals
    )
      return

    try {
      const quarterAmount = inputRawBalance / BigInt(100 / percent)
      const formattedQuarter = formatRawAmount(
        quarterAmount,
        BigInt(inputTokenDecimals)
      )

      if (validateAmount(formattedQuarter, inputTokenDecimals)) {
        setInAmount(formattedQuarter)
      }
    } catch (err) {
      console.error('Error calculating amount:', err)
    }
  }

  const handleInputTokenSelect = (token: { address: string }) => {
    if (!token || !token.address) {
      console.error('Invalid token selected')
      return
    }

    // Update store with new tokens & amounts
    setInputs({
      inputMint: token.address,
      outputMint: outputTokenMint,
      inputAmount: parseFloat(inAmount) || 0,
    })
    setShowInputTokenSearch(false)
  }

  const handleOutputTokenSelect = (token: { address: string }) => {
    if (!token || !token.address) {
      console.error('Invalid token selected')
      return
    }

    setInputs({
      inputMint: inputTokenMint,
      outputMint: token.address,
      inputAmount: parseFloat(inAmount) || 0,
    })
    setShowOutputTokenSearch(false)
  }

  const handleInAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      setInAmount(val)
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleOutAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      setOutAmount(val)
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleSwapDirection = () => {
    // Swap input/output tokens & amounts in store
    const tempIn = inputTokenMint
    const tempOut = outputTokenMint
    const tempAmtIn = inAmount
    const tempAmtOut = outAmount

    setInputs({
      inputMint: tempOut,
      outputMint: tempIn,
      inputAmount: parseFloat(tempAmtOut) || 0,
    })
    setInAmount(tempAmtOut)
    setOutAmount(tempAmtIn)
  }

  // Update amounts when quote changes
  useEffect(() => {
    if (swapMode === ESwapMode.EXACT_IN) {
      if (expectedOutput !== '') {
        setOutAmount(expectedOutput)
      }
    } else {
      if (expectedOutput !== '') {
        setInAmount(expectedOutput)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedOutput])

  // Inform parent (chart) of token for display
  useEffect(() => {
    if (setTokenMint) {
      setTokenMint(getTargetToken(inputTokenMint, outputTokenMint))
    }
  }, [inputTokenMint, outputTokenMint, setTokenMint])

  useEffect(() => {
    const hasUsed = localStorage.getItem('hasUsedSSEFee')
    if (hasUsed === 'true' && !notEnoughSSE) {
      setUseSSEForFeesState(true)
    } else {
      setUseSSEForFeesState(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (useSSEForFees) {
      localStorage.setItem('hasUsedSSEFee', 'true')
    }
  }, [useSSEForFees])

  // Track confirmed transactions
  const [confirmedTransactions, setConfirmedTransactions] = useState<string[]>(
    []
  )

  // Auto-reset transaction state after success and refetch quote
  useEffect(() => {
    if (isFullyConfirmed && txStatus?.status === 'confirmed' && txSignature) {
      // Add to confirmed transactions list only if it doesn't already exist
      setConfirmedTransactions((prev) => {
        if (!prev.includes(txSignature)) {
          return [...prev, txSignature]
        }
        return prev
      })

      // Immediately reset state and fetch new quote
      setTimeout(() => {
        resetQuoteState()
        // Force immediate quote refresh
        refreshQuote()
      }, 100) // Small delay to ensure state updates properly
    }
  }, [isFullyConfirmed, txStatus, txSignature, resetQuoteState, refreshQuote])

  const dismissTransaction = (signature: string) => {
    setConfirmedTransactions((prev) => prev.filter((sig) => sig !== signature))
  }

  // Determine if the user has used SSE before
  const hasUsedSSEBefore =
    typeof window !== 'undefined' &&
    localStorage.getItem('hasUsedSSEFee') === 'true'

  let executeButtonText = t('swap.execute_swap')
  let buttonDisabled = false

  // Handle transaction status in button
  if (txStatus) {
    switch (txStatus.status) {
      case 'sending':
        executeButtonText = 'Signing...'
        buttonDisabled = true
        break
      case 'sent':
      case 'confirming':
        executeButtonText = 'Confirming...'
        buttonDisabled = true
        break
      case 'failed':
      case 'timeout':
        executeButtonText = 'Failed - Try again'
        buttonDisabled = false
        break
    }
  } else if (notEnoughSSE) {
    executeButtonText = t('swap.insufficient_sse')
    buttonDisabled = true
  } else if (notEnoughInput) {
    executeButtonText = t('swap.insufficient_balance', {
      token: inputTokenSymbol || 'Balance',
    })
    buttonDisabled = true
  }

  return (
    <div className="space-y-4">
      <TopSwap
        walletAddress={walletAddress}
        setShowInputTokenSearch={setShowInputTokenSearch}
        handleInputAmountByPercentage={handleInputAmountByPercentage}
        setShowOutputTokenSearch={setShowOutputTokenSearch}
        handleSwapDirection={handleSwapDirection}
        autoFocus={autoFocus}
        notEnoughInput={notEnoughInput}
      />

      <CenterButtonSwap
        sdkHasLoaded={sdkHasLoaded}
        loading={
          loading ||
          txStatus?.status === 'sending' ||
          txStatus?.status === 'sent' ||
          txStatus?.status === 'confirming'
        }
        isLoggedIn={isLoggedIn}
        setShowAuthFlow={setShowAuthFlow}
        handleSwap={async () => {
          if (buttonDisabled) return

          // If we just completed a swap, allow immediate re-swap
          if (isFullyConfirmed) {
            resetQuoteState()
            // Don't clear amounts - user likely wants to swap again
          }

          await handleSwap()
        }}
        buttonText={executeButtonText}
        notReady={buttonDisabled}
      />

      {/* Transaction Status - shows during processing */}
      <TransactionStatus status={txStatus} />

      {/* Confirmed Transactions */}
      {confirmedTransactions.length > 0 && (
        <div className="space-y-2">
          {confirmedTransactions.map((sig) => (
            <TransactionLink
              key={sig}
              signature={sig}
              onDismiss={dismissTransaction}
            />
          ))}
        </div>
      )}

      <BottomSwap
        useSSEForFees={useSSEForFees}
        displaySseFeeAmount={displaySseFeeAmount}
        quoteResponse={quoteResponse}
        outputTokenSymbol={outputTokenSymbol}
        outputTokenDecimals={outputTokenDecimals}
        expectedOutput={expectedOutput}
        isQuoteRefreshing={isQuoteRefreshing}
        setUseSSEForFees={setUseSSEForFeesState}
        notEnoughSSE={notEnoughSSE}
        hasUsedSSEBefore={hasUsedSSEBefore}
      />

      {(showInputTokenSearch || showOutputTokenSearch) && (
        <TokenSearch
          openModal={showInputTokenSearch || showOutputTokenSearch}
          onSelect={
            showInputTokenSearch
              ? handleInputTokenSelect
              : handleOutputTokenSelect
          }
          onClose={() => {
            if (showInputTokenSearch) {
              setShowInputTokenSearch(false)
            } else {
              setShowOutputTokenSearch(false)
            }
          }}
        />
      )}
    </div>
  )
}
