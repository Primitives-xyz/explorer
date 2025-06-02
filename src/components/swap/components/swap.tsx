'use client'

import { useGetHomeAllTransactions } from '@/components/home-transactions/hooks/use-get-home-all-transactions'
import { TokenSearch } from '@/components/swap/components/swap-dialog/token-search'
import { BottomSwap } from '@/components/swap/components/swap-elements/bottom-swap'
import { CenterButtonSwap } from '@/components/swap/components/swap-elements/center-button-swap'
import { TopSwap } from '@/components/swap/components/swap-elements/top-swap'
import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { useTrade } from '@/components/trade/context/trade-context'
import { useJupiterSwap } from '@/components/trade/hooks/use-jupiter-swap'
import { useTokenBalance } from '@/components/trade/hooks/use-token-balance'
import { Avatar } from '@/components/ui/avatar/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EXPLORER_NAMESPACE, SOL_MINT, SSE_MINT } from '@/utils/constants'
import { listCache } from '@/utils/redis'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  abbreviateWalletAddress,
  formatLargeNumber,
  formatRawAmount,
  formatUsdValue,
} from '@/utils/utils'
import { Copy, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { useSwapStore } from '../stores/use-swap-store'
import { ESwapMode } from '../swap.models'
import { TransactionLink } from './transaction-link'
import { TransactionStatus } from './transaction-status'

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

  // Try to use the trade context, but make it optional
  let setTokenMint: ((mint: string) => void) | undefined
  try {
    const tradeContext = useTrade()
    setTokenMint = tradeContext.setTokenMint
  } catch (error) {
    // If we're outside TradeProvider, that's fine - setTokenMint will be undefined
    setTokenMint = undefined
  }

  // Centralized swap state from store
  const {
    inputs: {
      inputMint: inputTokenMint,
      outputMint: outputTokenMint,
      sourceWallet,
      sourceTransactionId,
    },
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
  const {
    balance: inputBalance,
    rawBalance: inputRawBalance,
    mutate: mutateInputBalance,
  } = useTokenBalance(walletAddress, inputTokenMint)
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
  const {
    balance: sseBalance,
    rawBalance: sseRawBalance,
    mutate: mutateSseBalance,
  } = useTokenBalance(walletAddress, SSE_MINT)

  // Add output token balance hook
  const {
    balance: outputBalance,
    rawBalance: outputRawBalance,
    mutate: mutateOutputBalance,
  } = useTokenBalance(walletAddress, outputTokenMint)

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
    sourceWallet: sourceWallet,
    sourceTransactionId: sourceTransactionId,
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
        // Don't clear sourceWallet/sourceTransactionId - amount changes are still copies
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
      // Clear copy trade info when selecting new token
      sourceWallet: undefined,
      sourceTransactionId: undefined,
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
      // Clear copy trade info when selecting new token
      sourceWallet: undefined,
      sourceTransactionId: undefined,
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
      // Don't clear sourceWallet/sourceTransactionId - amount changes are still copies
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
      // Don't clear sourceWallet/sourceTransactionId - amount changes are still copies
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
      // Clear copy trade info when swapping direction
      sourceWallet: undefined,
      sourceTransactionId: undefined,
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

  // Get refetch function from home transactions hook if we're on the home page
  const isHomePage =
    typeof window !== 'undefined' && window.location.pathname === '/'
  const { refetch: refetchHomeTransactions } = useGetHomeAllTransactions({
    pageSize: 20,
    infiniteScroll: true,
    skip: !isHomePage, // Skip if not on home page
  })

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

      // Emit swap success event for tracking
      const swapSuccessEvent = new CustomEvent('swap-success', {
        detail: {
          signature: txSignature,
          inputMint: inputTokenMint,
          outputMint: outputTokenMint,
          inputAmount: parseFloat(inAmount) || 0,
          outputAmount: parseFloat(outAmount) || 0,
        },
      })
      window.dispatchEvent(swapSuccessEvent)

      // Refresh token balances after successful swap
      mutateInputBalance()
      mutateOutputBalance()
      if (useSSEForFees) {
        mutateSseBalance()
      }

      // Clear cache and refresh feed if on home page
      const clearCacheAndRefresh = async () => {
        try {
          // Clear the list cache for home transactions
          await listCache.invalidate('home-all:*')

          // Refetch home transactions if we're on the home page
          if (isHomePage && refetchHomeTransactions) {
            setTimeout(() => {
              refetchHomeTransactions()
            }, 1000) // Give the content API time to process
          }
        } catch (error) {
          console.error('Error clearing cache:', error)
        }
      }

      clearCacheAndRefresh()

      // Immediately reset state and fetch new quote
      setTimeout(() => {
        resetQuoteState()
        // Force immediate quote refresh
        refreshQuote()
      }, 100) // Small delay to ensure state updates properly
    }
  }, [
    isFullyConfirmed,
    txStatus,
    txSignature,
    resetQuoteState,
    refreshQuote,
    mutateInputBalance,
    mutateOutputBalance,
    mutateSseBalance,
    useSSEForFees,
    isHomePage,
    refetchHomeTransactions,
  ])

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

  // Get source wallet profile if copying a trade
  const { profiles: sourceProfiles } = useGetProfiles({
    walletAddress: sourceWallet || '',
    skip: !sourceWallet,
  })

  const sourceProfile = sourceProfiles?.profiles?.find(
    (p) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  return (
    <div className="space-y-4">
      {/* Copy Trade Indicator */}
      {sourceWallet && (
        <Card className="border-muted bg-muted/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground border border-border/50"
                >
                  <Copy size={12} className="mr-1" />
                  {t('copy_trading.copy_trade')}
                </Badge>
                <div className="flex items-center gap-2">
                  {sourceProfile?.image && (
                    <Avatar
                      username={sourceProfile.username || sourceWallet}
                      imageUrl={sourceProfile.image}
                      size={20}
                      className="h-5 w-5"
                    />
                  )}
                  <span className="text-sm text-foreground">
                    {t('copy_trading.from')}{' '}
                    {sourceProfile?.username
                      ? `@${sourceProfile.username}`
                      : abbreviateWalletAddress({
                          address: sourceWallet,
                          desiredLength: 8,
                        })}
                  </span>
                </div>
              </div>
              <Button
                variant={ButtonVariant.GHOST}
                size={ButtonSize.ICON_SM}
                onClick={() => {
                  setInputs({
                    inputMint: inputTokenMint,
                    outputMint: outputTokenMint,
                    inputAmount: parseFloat(inAmount) || 0,
                    sourceWallet: undefined,
                    sourceTransactionId: undefined,
                  })
                }}
                title="Clear copy trade"
              >
                <X size={14} />
              </Button>
            </div>
            {sourceTransactionId && (
              <p className="text-xs text-muted-foreground mt-2">
                {t('copy_trading.original_trade')}:{' '}
                {abbreviateWalletAddress({
                  address: sourceTransactionId,
                  desiredLength: 8,
                })}
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
