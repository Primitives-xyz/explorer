'use client'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { AmountInput } from '@/components/transactions/swap/amount-input'
import { SwapQuoteDetails } from '@/components/transactions/swap/swap-quote-details'
import { SwapSettings } from '@/components/transactions/swap/swap-settings'
import { SwapShareSection } from '@/components/transactions/swap/swap-share-section'
import { TokenSearch } from '@/components/transactions/swap/token-search'
import { TokenSelectButton } from '@/components/transactions/swap/token-select-button'
import {
  DEFAULT_PRIORITY_LEVEL,
  DEFAULT_SLIPPAGE_BPS,
} from '@/constants/jupiter'
import { useJupiterSwap } from '@/hooks/use-jupiter-swap'
import { useTokenBalance } from '@/hooks/use-token-balance'
import { useTokenInfo } from '@/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/hooks/use-token-usdc-price'
import { JupiterSwapFormProps } from '@/types/jupiter'
import { ArrowLeftRight, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

// SSE token mint address
const SSE_MINT = 'SSEswapfK71dRNrqpXf7sPJyVRXHkz9PApdh8bRrst'

// Add LoadingDots component at the top level, after other component imports
const LoadingDots = () => {
  return (
    <span className="inline-flex items-center">
      <span className="animate-pulse">.</span>
      <span className="animate-pulse animation-delay-200">.</span>
      <span className="animate-pulse animation-delay-400">.</span>
    </span>
  )
}

export function SwapForm({
  initialInputMint = 'So11111111111111111111111111111111111111112',
  initialOutputMint = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',
  initialAmount = '',
  inputTokenName = 'SOL',
  outputTokenName = 'USDC',
  inputDecimals = 9,
  sourceWallet,
  hideWhenGlobalSearch,
}: JupiterSwapFormProps) {
  const [displayAmount, setDisplayAmount] = useState(initialAmount)
  const [effectiveAmount, setEffectiveAmount] = useState(initialAmount)
  const [debouncedUpdate, setDebouncedUpdate] = useState<NodeJS.Timeout | null>(
    null
  )
  const [inputError, setInputError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputMint, setInputMint] = useState(initialInputMint)
  const [outputMint, setOutputMint] = useState(initialOutputMint)
  const [currentInputToken, setCurrentInputToken] = useState(inputTokenName)
  const [currentOutputToken, setCurrentOutputToken] = useState(outputTokenName)
  const [useSSEForFees, setUseSSEForFees] = useState(false)
  const [currentInputDecimals, setCurrentInputDecimals] =
    useState(inputDecimals)
  const [showInputTokenSearch, setShowInputTokenSearch] = useState(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] = useState(false)
  const [isRouteInfoOpen, setIsRouteInfoOpen] = useState(false)

  // Add token info hooks
  const inputTokenInfo = useTokenInfo(inputMint)
  const outputTokenInfo = useTokenInfo(outputMint)
  const sseTokenInfo = useTokenInfo(SSE_MINT)

  // Add token price hooks for USD values
  const { price: inputTokenUsdPrice, loading: inputPriceLoading } =
    useTokenUSDCPrice(inputMint, inputTokenInfo.decimals)
  const { price: outputTokenUsdPrice, loading: outputPriceLoading } =
    useTokenUSDCPrice(outputMint, outputTokenInfo.decimals)

  const { isLoggedIn, sdkHasLoaded, walletAddress } = useCurrentWallet()

  const t = useTranslations()

  // Add token balance hooks for both tokens
  const {
    balance: inputBalance,
    rawBalance: inputRawBalance,
    loading: inputBalanceLoading,
  } = useTokenBalance(walletAddress, inputMint)
  const {
    balance: outputBalance,
    rawBalance: rawOutputBalance,
    loading: outputBalanceLoading,
  } = useTokenBalance(walletAddress, outputMint)

  // Update input decimals when input token changes
  useEffect(() => {
    setCurrentInputDecimals(inputTokenInfo.decimals ?? inputDecimals)
  }, [inputTokenInfo.decimals, inputDecimals])
  const {
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
  } = useJupiterSwap({
    inputMint,
    outputMint,
    inputAmount: effectiveAmount,
    inputDecimals: currentInputDecimals,
    sourceWallet,
    platformFeeBps: useSSEForFees ? 1 : undefined,
  })

  // Add useEffect for initial focus
  useEffect(() => {
    // Focus the input on component mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Function to validate amount
  const validateAmount = (value: string): boolean => {
    if (value === '') return true

    // Check if the value is a valid number
    const numericValue = Number(value)
    if (isNaN(numericValue)) {
      setInputError(t('error.please_enter_a_valid_number'))
      return false
    }

    // Check if the value is positive
    if (numericValue <= 0) {
      setInputError(t('error.amount_must_be_greater_than_0'))
      return false
    }

    // Check if the value has too many decimal places
    const decimalParts = value.split('.')
    if (
      decimalParts.length > 1 &&
      decimalParts[1]?.length &&
      decimalParts[1]?.length > currentInputDecimals
    ) {
      setInputError(
        `${t('trade.maximum')} ${currentInputDecimals} ${t(
          'trade.decimal_places_allowed'
        )}`
      )
      return false
    }

    setInputError(null)
    return true
  }

  // Function to update effective amount with debounce
  const updateEffectiveAmount = (value: string) => {
    if (debouncedUpdate) clearTimeout(debouncedUpdate)

    const timeout = setTimeout(() => {
      if (validateAmount(value)) {
        if (value !== '') {
          setEffectiveAmount(value)
        } else {
          setEffectiveAmount('')
        }
      } else {
        setEffectiveAmount('')
      }
    }, 500) // 500ms delay

    setDebouncedUpdate(timeout)
  }

  const handleSwapDirection = () => {
    // Reset all quote-related state first
    resetQuoteState()
    setDisplayAmount('')
    setEffectiveAmount('')
    if (debouncedUpdate) clearTimeout(debouncedUpdate)

    // Then swap the tokens
    setInputMint(outputMint)
    setOutputMint(inputMint)
    setCurrentInputToken(currentOutputToken)
    setCurrentOutputToken(currentInputToken)
  }

  // Show loading overlay when refreshing quote
  const showLoadingState = loading || isFullyConfirmed

  const handleInputTokenSelect = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }) => {
    setInputMint(token.address)
    setCurrentInputToken(token.symbol)
    setCurrentInputDecimals(token.decimals)
  }

  const handleOutputTokenSelect = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }) => {
    setOutputMint(token.address)
    setCurrentOutputToken(token.symbol)
  }

  // Updated helper function to show full decimal precision based on token decimals
  const formatLargeNumber = (num: number) => {
    // Handle very small numbers with exponential notation
    if (num !== 0 && Math.abs(num) < 0.0001) {
      return num.toExponential(4)
    }
    // Show up to token's decimal places for regular numbers
    const decimals = outputTokenInfo.decimals ?? 6
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    })
  }

  // Helper function to format USD values
  const formatUsdValue = (value: number | null) => {
    if (value === null || isNaN(value)) return '$0.00'

    // For very small values, show more precision
    if (value !== 0 && Math.abs(value) < 0.01) {
      return `$${value.toFixed(6)}`
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const handleReset = () => {
    // Reset all form states
    setDisplayAmount('')
    setEffectiveAmount('')
    setInputError(null)
    if (debouncedUpdate) clearTimeout(debouncedUpdate)
    resetQuoteState()
    // Reset to initial values
    setInputMint(initialInputMint)
    setOutputMint(initialOutputMint)
    setCurrentInputToken(inputTokenName)
    setCurrentOutputToken(outputTokenName)
    setCurrentInputDecimals(inputDecimals)
    setUseSSEForFees(false)
    setPriorityLevel(DEFAULT_PRIORITY_LEVEL)
    setSlippageBps(DEFAULT_SLIPPAGE_BPS)
    setIsRouteInfoOpen(false)
  }

  // Utility function to format raw token amounts
  const formatRawAmount = (rawAmount: bigint, decimals: bigint): string => {
    try {
      if (rawAmount === 0n) return '0'

      const divisor = 10n ** decimals
      const integerPart = rawAmount / divisor
      const fractionPart = rawAmount % divisor

      if (fractionPart === 0n) {
        return integerPart.toString()
      }

      // Convert to string and pad with zeros
      let fractionStr = fractionPart.toString()
      while (fractionStr.length < Number(decimals)) {
        fractionStr = '0' + fractionStr
      }

      // Remove trailing zeros
      fractionStr = fractionStr.replace(/0+$/, '')

      return fractionStr
        ? `${integerPart}.${fractionStr}`
        : integerPart.toString()
    } catch (err) {
      console.error('Error formatting amount:', err)
      return '0'
    }
  }

  // Add handlers for quarter, half and max amount
  const handleQuarterAmount = () => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint') return

    try {
      // Calculate quarter of the raw balance using bigint arithmetic
      const quarterAmount = inputRawBalance / 4n
      const formattedQuarter = formatRawAmount(
        quarterAmount,
        BigInt(currentInputDecimals)
      )

      if (validateAmount(formattedQuarter)) {
        setDisplayAmount(formattedQuarter)
        setEffectiveAmount(formattedQuarter)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating quarter amount:', err)
    }
  }

  const handleHalfAmount = () => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint') return

    try {
      // Calculate half of the raw balance using bigint arithmetic
      const halfAmount = inputRawBalance / 2n
      const formattedHalf = formatRawAmount(
        halfAmount,
        BigInt(currentInputDecimals)
      )

      if (validateAmount(formattedHalf)) {
        setDisplayAmount(formattedHalf)
        setEffectiveAmount(formattedHalf)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating half amount:', err)
    }
  }

  const handleMaxAmount = () => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint') return

    try {
      const formattedMax = formatRawAmount(
        inputRawBalance,
        BigInt(currentInputDecimals)
      )

      if (validateAmount(formattedMax)) {
        setDisplayAmount(formattedMax)
        setEffectiveAmount(formattedMax)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating max amount:', err)
    }
  }

  return (
    <div className="p-3 bg-green-900/10 rounded-lg space-y-3">
      <div className="flex flex-col gap-2">
        {/* Amount Input */}
        <AmountInput
          value={displayAmount}
          onChange={setDisplayAmount}
          onEffectiveAmountChange={setEffectiveAmount}
          balance={inputBalance}
          isLoggedIn={isLoggedIn}
          isBalanceLoading={inputBalanceLoading}
          disabled={showLoadingState}
          error={inputError}
          validateAmount={validateAmount}
          onQuarterClick={handleQuarterAmount}
          onHalfClick={handleHalfAmount}
          onMaxClick={handleMaxAmount}
          usdValue={
            inputTokenUsdPrice && displayAmount
              ? formatUsdValue(parseFloat(displayAmount) * inputTokenUsdPrice)
              : null
          }
          isUsdValueLoading={inputPriceLoading}
        />

        {/* Token Selection */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <TokenSelectButton
              tokenInfo={inputTokenInfo}
              currentToken={currentInputToken}
              balance={inputBalance}
              isBalanceLoading={inputBalanceLoading}
              isLoggedIn={isLoggedIn}
              disabled={showLoadingState}
              onClick={() => setShowInputTokenSearch(true)}
            />
          </div>

          <button
            onClick={handleSwapDirection}
            disabled={showLoadingState}
            className="bg-green-900/20 hover:bg-green-900/30 p-2 rounded-lg transition-colors relative z-10"
            title="Swap direction"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <div className="flex-1">
            <TokenSelectButton
              tokenInfo={outputTokenInfo}
              currentToken={currentOutputToken}
              balance={outputBalance}
              isBalanceLoading={outputBalanceLoading}
              isLoggedIn={isLoggedIn}
              disabled={showLoadingState}
              onClick={() => setShowOutputTokenSearch(true)}
            />
          </div>
        </div>

        {/* Quote Details - Streamlined */}
        {(quoteResponse || effectiveAmount) && !isFullyConfirmed && (
          <div className="mt-1">
            <div className="bg-green-900/20 p-2 rounded-lg">
              {/* You Receive Section - Compact */}
              <div className="flex items-center justify-between p-2 bg-green-900/20 rounded-lg mb-2">
                <div className="text-xs text-green-100/80">
                  {t('trade.you_receive')}
                </div>
                <div className="flex items-center gap-2">
                  {outputTokenInfo.image && (
                    <img
                      src={outputTokenInfo.image}
                      alt={outputTokenInfo.symbol || currentOutputToken}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1">
                      <div className="text-base font-semibold">
                        {isQuoteRefreshing ? (
                          <span className="animate-pulse">
                            {formatLargeNumber(
                              parseFloat(expectedOutput || '0')
                            )}
                          </span>
                        ) : quoteResponse ? (
                          formatLargeNumber(parseFloat(expectedOutput))
                        ) : (
                          '0'
                        )}
                      </div>
                      <div className="text-sm font-medium text-green-100/80">
                        {outputTokenInfo.symbol || currentOutputToken}
                      </div>
                    </div>
                    {/* USD Value */}
                    <div className="text-xs text-green-100/70">
                      {isQuoteRefreshing || outputPriceLoading ? (
                        <span className="animate-pulse">
                          {formatUsdValue(0)}
                        </span>
                      ) : quoteResponse && outputTokenUsdPrice ? (
                        formatUsdValue(
                          parseFloat(expectedOutput) * outputTokenUsdPrice
                        )
                      ) : (
                        formatUsdValue(0)
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Info - Compact Grid */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {/* Rate */}
                <div className="p-2 bg-green-900/20 rounded-lg">
                  <div className="text-xs text-green-100/80 mb-1">
                    {t('trade.rate')}
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="font-medium">
                      1 {inputTokenInfo.symbol || currentInputToken}
                    </span>
                    <span className="mx-1">≈</span>
                    <span className="font-medium">
                      {isQuoteRefreshing ? (
                        <span className="animate-pulse">
                          {quoteResponse
                            ? (
                                Number(quoteResponse.outAmount) /
                                Math.pow(10, outputTokenInfo.decimals ?? 9) /
                                (Number(quoteResponse.inAmount) /
                                  Math.pow(10, currentInputDecimals))
                              ).toFixed(4)
                            : '0'}
                        </span>
                      ) : quoteResponse ? (
                        (
                          Number(quoteResponse.outAmount) /
                          Math.pow(10, outputTokenInfo.decimals ?? 9) /
                          (Number(quoteResponse.inAmount) /
                            Math.pow(10, currentInputDecimals))
                        ).toFixed(4)
                      ) : (
                        '0'
                      )}{' '}
                      {outputTokenInfo.symbol || currentOutputToken}
                    </span>
                  </div>
                </div>

                {/* Price Impact */}
                <div className="p-2 bg-green-900/20 rounded-lg">
                  <div className="text-xs text-green-100/80 mb-1">
                    {t('trade.price_impact')}
                  </div>
                  <div className="text-xs">
                    {quoteResponse && priceImpact ? (
                      <span
                        className={`font-medium ${
                          parseFloat(priceImpact) <= -3
                            ? 'text-red-400'
                            : parseFloat(priceImpact) <= -1
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}
                      >
                        {parseFloat(priceImpact).toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-green-100/70">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Sections */}
              <div className="space-y-2">
                {/* Settings - Collapsible */}
                <div className="rounded-lg overflow-hidden border border-green-900/30">
                  <button
                    onClick={() => setIsRouteInfoOpen(!isRouteInfoOpen)}
                    className="flex items-center justify-between w-full p-2 bg-green-900/20 hover:bg-green-900/30 transition-colors text-xs font-medium"
                  >
                    <span>{t('trade.route_information_fees')}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isRouteInfoOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isRouteInfoOpen && (
                    <div className="p-2 bg-green-900/10 text-xs">
                      {isQuoteRefreshing ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span>{t('trade.network_fee')}</span>
                            <span>
                              {t('trade.updating')}
                              <LoadingDots />
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{t('trade.minimum_received')}</span>
                            <span>
                              {t('trade.updating')}
                              <LoadingDots />
                            </span>
                          </div>
                        </div>
                      ) : quoteResponse ? (
                        <SwapQuoteDetails
                          quoteResponse={quoteResponse}
                          priceImpact={priceImpact}
                          slippageBps={slippageBps}
                          useSSEForFees={useSSEForFees}
                          sseFeeAmount={
                            useSSEForFees ? sseFeeAmount : undefined
                          }
                        />
                      ) : null}

                      {/* Slippage Settings - Inline */}
                      <div className="mt-2 pt-2 border-t border-green-900/20">
                        <SwapSettings
                          slippageBps={slippageBps}
                          onSlippageChange={setSlippageBps}
                          priorityLevel={priorityLevel}
                          onPriorityChange={setPriorityLevel}
                          disabled={showLoadingState}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SSE Fee Option - Compact */}
                <label className="flex items-center gap-2 p-2 bg-green-900/20 rounded-lg border border-green-400/20 hover:border-green-400/40 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSSEForFees}
                    onChange={(e) => {
                      setUseSSEForFees(e.target.checked)
                      resetQuoteState()
                    }}
                    className="w-4 h-4 rounded bg-green-900/20 border-green-400 focus:ring-green-400"
                  />
                  <div className="flex items-center gap-2">
                    {sseTokenInfo.image && (
                      <img
                        src={sseTokenInfo.image}
                        alt={sseTokenInfo.symbol || 'SSE'}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <div>
                      <div className="text-xs font-medium">
                        {t('trade.pay_fees_with_sse')}
                      </div>
                      <div className="text-xs text-green-100/70">
                        {t('trade.get_50_off_on_transaction_fees')}
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isFullyConfirmed && (
          <>
            {!sdkHasLoaded ? (
              <div className="mt-1 bg-green-900/20 rounded-lg p-2 border border-green-400/20">
                <div className="flex items-center justify-center gap-2">
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-green-400/20 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-green-400 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <span className="text-xs font-medium">
                    {t('trade.checking_wallet_status')}
                    <LoadingDots />
                  </span>
                </div>
              </div>
            ) : !isLoggedIn ? (
              <DynamicConnectButton>
                <div className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg disabled:opacity-50 w-full text-center cursor-pointer font-medium text-sm">
                  {t('trade.connect_wallet_to_swap')}
                </div>
              </DynamicConnectButton>
            ) : (
              <button
                onClick={handleSwap}
                disabled={showLoadingState}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg disabled:opacity-50 w-full font-medium text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>
                      {txSignature
                        ? `${t('trade.confirming_transaction')}...`
                        : `${t('trade.executing_swap')}...`}
                    </span>
                  </div>
                ) : (
                  t('trade.execute_swap')
                )}
              </button>
            )}
          </>
        )}

        {error && (
          <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded-lg">
            {error.includes(t('error.amount_cannot_be_parsed'))
              ? t('error.please_enter_a_valid_amount')
              : error}
          </div>
        )}

        {txSignature && showTradeLink && (
          <SwapShareSection txSignature={txSignature} onReset={handleReset} />
        )}
      </div>

      {/* Token Search Modals */}
      {showInputTokenSearch && (
        <TokenSearch
          onSelect={handleInputTokenSelect}
          onClose={() => setShowInputTokenSearch(false)}
          hideWhenGlobalSearch={hideWhenGlobalSearch}
        />
      )}
      {showOutputTokenSearch && (
        <TokenSearch
          onSelect={handleOutputTokenSelect}
          onClose={() => setShowOutputTokenSearch(false)}
          hideWhenGlobalSearch={hideWhenGlobalSearch}
        />
      )}
    </div>
  )
}
