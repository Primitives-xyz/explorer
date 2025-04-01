'use client'

import { useJupiterSwap } from '@/components-new-version/tapestry/hooks/use-jupiter-swap'
import { useTokenBalance } from '@/components-new-version/tapestry/hooks/use-token-balance'
import { useTokenInfo } from '@/components-new-version/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components-new-version/token/hooks/use-token-usdc-price'
import PlatformComparison from '@/components-new-version/trade/left-content/swap/platform-comparison'
import { TopSwap } from '@/components-new-version/trade/left-content/swap/top-swap/top-swap'
import { TokenSearch } from '@/components-new-version/transaction/swap/token-search'
import { Button, ButtonVariant } from '@/components-new-version/ui'
import { Card, CardContent } from '@/components-new-version/ui/card'
import LoadingDots from '@/components-new-version/ui/loading-dots'
import { SOL_MINT, SSE_MINT } from '@/components-new-version/utils/constants'
import {
  formatLargeNumber,
  formatRawAmount,
  formatUsdValue,
} from '@/components-new-version/utils/format'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { ChevronDown, ChevronUp, CircleAlert, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

export enum SwapMode {
  EXACT_IN = 'ExactIn',
  EXACT_OUT = 'ExactOut',
}

interface SwapProps {
  mint: string
  setTokenMint: (value: string) => void
}

export function Swap({ mint, setTokenMint }: SwapProps) {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [inputTokenMint, setInputTokenMint] = useState<string>(SOL_MINT)
  const [outputTokenMint, setoutputTokenMint] = useState<string>(SSE_MINT)
  const [inAmount, setInAmount] = useState<string>('')
  const [outAmount, setOutAmount] = useState<string>('')
  const [swapMode, setSwapMode] = useState<SwapMode>(SwapMode.EXACT_IN)
  const [useSSEForFees, setUseSSEForFees] = useState<boolean>(false)
  const [isRouteInfoOpen, setIsRouteInfoOpen] = useState<boolean>(false)
  const [showInputTokenSearch, setShowInputTokenSearch] =
    useState<boolean>(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] =
    useState<boolean>(false)
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
    isLoggedIn,
    sdkHasLoaded,
    walletAddress,
    primaryWallet,
    setShowAuthFlow,
  } = useCurrentWallet()
  const {
    balance: inputBalance,
    rawBalance: inputRawBalance,
    loading: inputBalanceLoading,
  } = useTokenBalance(walletAddress, inputTokenMint)

  const {
    loading,
    error,
    txSignature,
    quoteResponse,
    expectedOutput,
    priceImpact,
    isFullyConfirmed,
    handleSwap,
    isQuoteRefreshing,
    refreshQuote,
    sseFeeAmount,
  } = useJupiterSwap({
    inputMint: inputTokenMint,
    outputMint: outputTokenMint,
    inputAmount: swapMode === SwapMode.EXACT_IN ? inAmount : outAmount,
    inputDecimals:
      swapMode === SwapMode.EXACT_IN ? inputTokenDecimals : outputTokenDecimals,
    outputDecimals:
      swapMode === SwapMode.EXACT_OUT
        ? inputTokenDecimals
        : outputTokenDecimals,
    platformFeeBps: useSSEForFees ? 1 : undefined,
    primaryWallet: primaryWallet,
    walletAddress: walletAddress,
    swapMode: swapMode,
  })

  console.log('sseFeeAmount:', sseFeeAmount)

  const displayInAmount = useMemo(() => {
    if (isQuoteRefreshing && swapMode === SwapMode.EXACT_OUT) {
      return '...'
    }
    if (inAmount == '') {
      return ''
    } else {
      if (swapMode === SwapMode.EXACT_IN) {
        return inAmount
      } else {
        return formatLargeNumber(parseFloat(inAmount), inputTokenDecimals)
      }
    }
  }, [inAmount, inputTokenDecimals, isQuoteRefreshing, swapMode])

  const displayOutAmount = useMemo(() => {
    if (isQuoteRefreshing && swapMode === SwapMode.EXACT_IN) {
      return '...'
    }
    if (outAmount == '') {
      return ''
    } else {
      if (swapMode === SwapMode.EXACT_OUT) {
        return outAmount
      } else {
        return formatLargeNumber(parseFloat(outAmount), outputTokenDecimals)
      }
    }
  }, [isQuoteRefreshing, swapMode, outAmount, outputTokenDecimals])

  const displayInAmountInUsd = useMemo(() => {
    if (
      isQuoteRefreshing ||
      !inputTokenUsdPrice ||
      isNaN(parseFloat(inAmount))
    ) {
      return '...'
    }
    return formatUsdValue(inputTokenUsdPrice * parseFloat(inAmount))
  }, [isQuoteRefreshing, inputTokenUsdPrice, inAmount])

  const displayOutAmountInUsd = useMemo(() => {
    if (
      isQuoteRefreshing ||
      !outputTokenUsdPrice ||
      isNaN(parseFloat(outAmount))
    ) {
      return '...'
    }
    return formatUsdValue(outputTokenUsdPrice * parseFloat(outAmount))
  }, [isQuoteRefreshing, outputTokenUsdPrice, outAmount])

  const displaySseFeeAmount = useMemo(() => {
    const fee = (Number(sseFeeAmount) / Math.pow(10, 6)).toString()

    return formatLargeNumber(parseFloat(fee), 6)
  }, [sseFeeAmount])

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

  const handleInputTokenSelect = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }) => {
    setInputTokenMint(token.address)
  }

  const handleOutputTokenSelect = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }) => {
    setoutputTokenMint(token.address)
  }

  const updateTokensInURL = useCallback(
    (input: string, output: string) => {
      const params = new URLSearchParams(searchParams.toString())

      params.set('inputMint', input)
      params.set('outputMint', output)
      params.set('mode', 'swap')

      router.push(`/new-trade?${params.toString()}`, { scroll: false })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  )

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
    setInAmount('')
    setOutAmount('')

    const tempTokenMint = inputTokenMint

    setInputTokenMint(outputTokenMint)
    setoutputTokenMint(tempTokenMint)
  }

  useEffect(() => {
    if (swapMode === SwapMode.EXACT_IN) {
      if (inAmount == '' || isNaN(parseFloat(expectedOutput))) {
        setOutAmount('')
      } else {
        setOutAmount(expectedOutput)
      }
    } else {
      if (outAmount == '' || isNaN(parseFloat(expectedOutput))) {
        setInAmount('')
      } else {
        setInAmount(expectedOutput)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedOutput])

  useEffect(() => {
    setTokenMint(outputTokenMint)
  }, [outputTokenMint, setTokenMint])

  useEffect(() => {
    if (inputTokenMint && outputTokenMint) {
      updateTokensInURL(inputTokenMint, outputTokenMint)
    }
  }, [inputTokenMint, outputTokenMint, updateTokensInURL])

  return (
    <div className="space-y-4">
      <TopSwap
        walletAddress={walletAddress}
        inputTokenMint={inputTokenMint}
        setSwapMode={setSwapMode}
        handleInAmountChange={handleInAmountChange}
        displayInAmount={displayInAmount}
        displayInAmountInUsd={displayInAmountInUsd}
        setShowInputTokenSearch={setShowInputTokenSearch}
        inputTokenImageUri={inputTokenImageUri}
        inputTokenSymbol={inputTokenSymbol}
        handleInputAmountByPercentage={handleInputAmountByPercentage}
        handleOutAmountChange={handleOutAmountChange}
        displayOutAmount={displayOutAmount}
        displayOutAmountInUsd={displayOutAmountInUsd}
        setShowOutputTokenSearch={setShowOutputTokenSearch}
        outputTokenImageUri={outputTokenImageUri}
        outputTokenSymbol={outputTokenSymbol}
        handleSwapDirection={handleSwapDirection}
      />

      <div>
        {!sdkHasLoaded && (
          <Button variant={ButtonVariant.DEFAULT} className="w-full">
            {t('trade.checking_wallet_status')}
            <LoadingDots />
          </Button>
        )}

        {!isLoggedIn ? (
          <Button
            expand
            variant={ButtonVariant.DEFAULT}
            onClick={() => setShowAuthFlow(true)}
          >
            connect wallet
          </Button>
        ) : (
          <Button
            variant={ButtonVariant.DEFAULT}
            className="w-full"
            onClick={handleSwap}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <span>Execute Swap</span>
            )}
          </Button>
        )}
      </div>

      <Card>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p>Route Information $ Fees</p>
              <CircleAlert />
            </div>

            <Card className="background-gradient-card">
              <CardContent className="px-3 py-2">
                <div className="flex items-center">
                  <div
                    className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer"
                    onClick={() => setUseSSEForFees(!useSSEForFees)}
                  >
                    {useSSEForFees && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <p>Pay fee with SSE</p>
                    <p>Get 50% off on transaction fees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <p>Rate</p>
              <p>{displaySseFeeAmount} SSE</p>
            </div>

            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsRouteInfoOpen(!isRouteInfoOpen)}
            >
              <p>SSE offers the cheapest fee across all current platforms.</p>
              {isRouteInfoOpen ? (
                <ChevronDown className="h-8 w-8" />
              ) : (
                <ChevronUp className="h-8 w-8" />
              )}
            </div>

            {isRouteInfoOpen && (
              <Card>
                <CardContent className="px-3 py-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="uppercase">platforms</p>
                    <p>You'll get</p>
                  </div>

                  <>
                    {isQuoteRefreshing ? (
                      <div className="h-full flex justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : (
                      <PlatformComparison
                        jupiterSwapResponse={quoteResponse}
                        outputTokenSymbol={outputTokenSymbol}
                        outputTokenDecimals={outputTokenDecimals}
                        platformExpectedOutAmount={expectedOutput}
                      />
                    )}
                  </>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {showInputTokenSearch && (
        <TokenSearch
          onSelect={handleInputTokenSelect}
          onClose={() => {
            setShowInputTokenSearch(false)
            setInAmount('')
          }}
        />
      )}
      {showOutputTokenSearch && (
        <TokenSearch
          onSelect={handleOutputTokenSelect}
          onClose={() => {
            setShowOutputTokenSearch(false)
            setInAmount('')
          }}
        />
      )}
    </div>
  )
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
