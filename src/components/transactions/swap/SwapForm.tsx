'use client'
import { useState, useRef, useEffect } from 'react'
import { Loader2, ArrowLeftRight } from 'lucide-react'
import { useJupiterSwap } from '@/hooks/use-jupiter-swap'
import { useTokenInfo } from '@/hooks/use-token-info'
import { SwapQuoteDetails } from './SwapQuoteDetails'
import { SwapShareSection } from './SwapShareSection'
import type { JupiterSwapFormProps } from '@/types/jupiter'
import { TokenSearch } from './TokenSearch'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import dynamic from 'next/dynamic'
import { useTokenBalance } from '@/hooks/use-token-balance'
import { TokenSelectButton } from './TokenSelectButton'
import { AmountInput } from './AmountInput'
import { SwapSettings } from './SwapSettings'
import {
  DEFAULT_PRIORITY_LEVEL,
  DEFAULT_SLIPPAGE_BPS,
} from '@/constants/jupiter'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton,
    ),
  { ssr: false },
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
  initialAmount = '0.01',
  inputTokenName = 'SOL',
  outputTokenName = 'USDC',
  inputDecimals = 9,
  sourceWallet,
  hideWhenGlobalSearch,
}: JupiterSwapFormProps) {
  const [displayAmount, setDisplayAmount] = useState(initialAmount)
  const [effectiveAmount, setEffectiveAmount] = useState(initialAmount)
  const [debouncedUpdate, setDebouncedUpdate] = useState<NodeJS.Timeout | null>(
    null,
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

  const { isLoggedIn, sdkHasLoaded, walletAddress } = useCurrentWallet()

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
  console.log({ useSSEForFees })
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
      setInputError('Please enter a valid number')
      return false
    }

    // Check if the value is positive
    if (numericValue <= 0) {
      setInputError('Amount must be greater than 0')
      return false
    }

    // Check if the value has too many decimal places
    const decimalParts = value.split('.')
    if (
      decimalParts.length > 1 &&
      decimalParts[1]?.length &&
      decimalParts[1]?.length > currentInputDecimals
    ) {
      setInputError(`Maximum ${currentInputDecimals} decimal places allowed`)
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

  // Helper function to format large numbers with K/M suffix
  const formatLargeNumber = (num: number) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M'
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(2) + 'K'
    }
    // Handle small numbers with more decimal places
    if (num < 0.001) {
      return num.toFixed(6)
    }
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    })
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

  return (
    <div className="p-4 bg-green-900/10 rounded-lg space-y-4">
      <div className="flex flex-col gap-3">
        {/* Amount Input */}
        <AmountInput
          value={displayAmount}
          onChange={setDisplayAmount}
          onEffectiveAmountChange={setEffectiveAmount}
          balance={inputBalance}
          isLoggedIn={isLoggedIn}
          isBalanceLoading={inputBalanceLoading}
          disabled={showLoadingState}
          onHalf={() => {
            if (!inputRawBalance) return

            // Calculate half and round to 2 decimal places
            const halfValue = Math.floor((inputRawBalance * 100) / 2) / 100
            setDisplayAmount(halfValue.toFixed(2))
            updateEffectiveAmount(halfValue.toFixed(2))
          }}
          onMax={() => {
            if (!inputRawBalance) return

            // Round to 2 decimal places
            const value = Math.floor(inputRawBalance * 100) / 100
            setDisplayAmount(value.toFixed(2))
            updateEffectiveAmount(value.toFixed(2))
          }}
          error={inputError}
          validateAmount={validateAmount}
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
            className="bg-green-900/20 hover:bg-green-900/30 p-3 rounded-lg transition-colors"
            title="Swap direction"
          >
            <ArrowLeftRight className="h-5 w-5 text-green-400" />
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

        {/* Quote Details */}
        {(quoteResponse || effectiveAmount) && !isFullyConfirmed && (
          <div className="space-y-3 mt-2">
            <div className="bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-green-500 mb-1">
                    You&apos;ll receive
                  </div>
                  <div className="flex items-center gap-2">
                    {outputTokenInfo.image && (
                      <img
                        src={outputTokenInfo.image}
                        alt={outputTokenInfo.symbol || currentOutputToken}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div className="text-2xl font-semibold">
                      {isQuoteRefreshing ? (
                        <span className="text-green-400/70 animate-pulse">
                          {formatLargeNumber(parseFloat(expectedOutput || '0'))}
                        </span>
                      ) : quoteResponse ? (
                        formatLargeNumber(parseFloat(expectedOutput))
                      ) : (
                        '0'
                      )}
                    </div>
                  </div>
                  {isLoggedIn && !outputBalanceLoading && quoteResponse && (
                    <div className="text-sm text-green-500 mt-1">
                      After:{' '}
                      {formatLargeNumber(
                        rawOutputBalance + parseFloat(expectedOutput || '0'),
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm text-green-500 mb-1">Rate</div>
                  <div className="font-medium">
                    {isQuoteRefreshing ? (
                      <span className="text-green-400/70 animate-pulse">
                        {quoteResponse
                          ? (
                              Number(quoteResponse.outAmount) /
                              Math.pow(10, outputTokenInfo.decimals ?? 9) /
                              (Number(quoteResponse.inAmount) /
                                Math.pow(10, currentInputDecimals))
                            ).toFixed(6)
                          : '0'}
                      </span>
                    ) : quoteResponse ? (
                      (
                        Number(quoteResponse.outAmount) /
                        Math.pow(10, outputTokenInfo.decimals ?? 9) /
                        (Number(quoteResponse.inAmount) /
                          Math.pow(10, currentInputDecimals))
                      ).toFixed(6)
                    ) : (
                      '0'
                    )}
                  </div>
                  <div className="text-sm text-green-500/70">
                    per {inputTokenInfo.symbol || currentInputToken}
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <SwapSettings
                slippageBps={slippageBps}
                onSlippageChange={setSlippageBps}
                priorityLevel={priorityLevel}
                onPriorityChange={setPriorityLevel}
                disabled={showLoadingState}
              />

              {/* Route Information & Fees */}
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => setIsRouteInfoOpen(!isRouteInfoOpen)}
                  className="flex items-center justify-between w-full p-3 bg-green-900/20 rounded-lg hover:bg-green-900/30 transition-colors"
                >
                  <span className="text-sm font-medium text-green-400">
                    Route Information & Fees
                  </span>
                  <svg
                    className={`w-5 h-5 text-green-400 transition-transform ${
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
                  <div className="space-y-2 p-3 bg-green-900/20 rounded-lg">
                    {isQuoteRefreshing ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-400">
                            Network Fee
                          </span>
                          <span className="text-green-400/70">
                            Updating
                            <LoadingDots />
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-400">
                            Price Impact
                          </span>
                          <span className="text-green-400/70">
                            Updating
                            <LoadingDots />
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-400">
                            Minimum Received
                          </span>
                          <span className="text-green-400/70">
                            Updating
                            <LoadingDots />
                          </span>
                        </div>
                      </>
                    ) : quoteResponse ? (
                      <SwapQuoteDetails
                        quoteResponse={quoteResponse}
                        priceImpact={priceImpact}
                        slippageBps={slippageBps}
                        useSSEForFees={useSSEForFees}
                        sseFeeAmount={useSSEForFees ? sseFeeAmount : undefined}
                      />
                    ) : null}
                  </div>
                )}
              </div>

              {/* SSE Fee Option */}
              <div className="mt-4">
                <label className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-400/20 hover:border-green-400/40 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSSEForFees}
                    onChange={(e) => {
                      setUseSSEForFees(e.target.checked)
                      resetQuoteState()
                    }}
                    className="w-5 h-5 rounded bg-green-900/20 border-green-400 text-green-400 focus:ring-green-400"
                  />
                  <div className="flex items-center gap-3">
                    {sseTokenInfo.image && (
                      <img
                        src={sseTokenInfo.image}
                        alt={sseTokenInfo.symbol || 'SSE'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">Pay fees with SSE</div>
                      <div className="text-sm text-green-500/70">
                        Get 50% off on transaction fees
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
              <div className="mt-2 bg-green-900/20 rounded-lg p-3 border border-green-400/20">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 border-2 border-green-400/20 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-green-400 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <span className="text-green-400/70 text-sm font-medium">
                    Checking wallet status
                    <LoadingDots />
                  </span>
                </div>
              </div>
            ) : !isLoggedIn ? (
              <DynamicConnectButton>
                <div className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 w-full text-center cursor-pointer font-medium">
                  Connect Wallet to Swap
                </div>
              </DynamicConnectButton>
            ) : (
              <button
                onClick={handleSwap}
                disabled={showLoadingState}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 w-full font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {txSignature
                        ? 'Confirming Transaction...'
                        : 'Executing Swap...'}
                    </span>
                  </div>
                ) : (
                  'Execute Swap'
                )}
              </button>
            )}
          </>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
            {error.includes('amount cannot be parsed')
              ? 'Please enter a valid amount'
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
