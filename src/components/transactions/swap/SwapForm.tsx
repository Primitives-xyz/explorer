'use client'
import { useState, useRef, useEffect } from 'react'
import { Loader2, ArrowLeftRight, Info } from 'lucide-react'
import { useJupiterSwap } from '@/hooks/use-jupiter-swap'
import { useTokenInfo } from '@/hooks/use-token-info'
import { SwapQuoteDetails } from './SwapQuoteDetails'
import { SwapShareSection } from './SwapShareSection'
import { PRIORITY_LEVELS, SLIPPAGE_OPTIONS } from '@/constants/jupiter'
import type { JupiterSwapFormProps, PriorityLevel } from '@/types/jupiter'
import { TokenSearch } from './TokenSearch'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import dynamic from 'next/dynamic'
import { useTokenBalance } from '@/hooks/use-token-balance'

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
  const [isRouteInfoOpen, setIsRouteInfoOpen] = useState(false)
  const [useSSEForFees, setUseSSEForFees] = useState(false)
  const [currentInputDecimals, setCurrentInputDecimals] =
    useState(inputDecimals)
  const [showInputTokenSearch, setShowInputTokenSearch] = useState(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] = useState(false)

  // Add token info hooks
  const inputTokenInfo = useTokenInfo(inputMint)
  const outputTokenInfo = useTokenInfo(outputMint)
  const sseTokenInfo = useTokenInfo(SSE_MINT)

  const { isLoggedIn, sdkHasLoaded, walletAddress } = useCurrentWallet()

  // Add token balance hooks for both tokens
  const {
    balance: inputBalance,
    rawBalance: rawInputBalance,
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
    platformFeeBps: useSSEForFees ? 0 : undefined,
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
    return num.toFixed(2)
  }

  return (
    <div className="p-4 bg-green-900/10 rounded-lg space-y-4">
      <div className="flex flex-col gap-2">
        <div className="space-y-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            placeholder="Amount"
            className={`bg-green-900/20 text-green-100 p-2 rounded w-full ${
              inputError ? 'border border-red-500' : ''
            }`}
            value={displayAmount}
            onFocus={(e) => {
              e.preventDefault()
              const pos = e.target.selectionStart
              requestAnimationFrame(() => {
                e.target.focus()
                e.target.setSelectionRange(pos, pos)
              })
            }}
            onChange={(e) => {
              const value = e.target.value
              // Allow empty value, decimal numbers in progress, and positive numbers
              if (
                value === '' ||
                value === '.' ||
                /^[0]?\.[0-9]*$/.test(value) || // Allows .0, 0.0, .00, 0.00, etc
                /^[0-9]*\.?[0-9]*$/.test(value) // Allow any valid decimal number
              ) {
                const cursorPosition = e.target.selectionStart
                setDisplayAmount(value)
                updateEffectiveAmount(value)
                // Restore cursor position after state update
                window.setTimeout(() => {
                  e.target.focus()
                  e.target.setSelectionRange(cursorPosition, cursorPosition)
                }, 0)
              }
            }}
            disabled={showLoadingState}
          />
          {inputError && <p className="text-red-500 text-sm">{inputError}</p>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <button
              className="bg-green-900/20 text-green-100 p-2 pl-10 rounded w-full text-left flex items-center justify-between hover:bg-green-900/30 transition-colors"
              onClick={() => setShowInputTokenSearch(true)}
              disabled={showLoadingState}
            >
              <div className="flex items-center gap-2">
                {inputTokenInfo.image && (
                  <img
                    src={inputTokenInfo.image}
                    alt={inputTokenInfo.symbol || currentInputToken}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
                  />
                )}
                <span>{inputTokenInfo.symbol || currentInputToken}</span>
              </div>
              {isLoggedIn && (
                <span className="text-sm text-green-400">
                  {inputBalanceLoading ? '...' : `You have: ${inputBalance}`}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleSwapDirection}
            disabled={showLoadingState}
            className="bg-green-900/20 hover:bg-green-900/30 p-2 rounded-full transition-colors"
            title="Swap direction"
          >
            <ArrowLeftRight className="h-4 w-4 text-green-400" />
          </button>

          <div className="flex-1 relative">
            <button
              className="bg-green-900/20 text-green-100 p-2 pl-10 rounded w-full text-left flex items-center justify-between hover:bg-green-900/30 transition-colors"
              onClick={() => setShowOutputTokenSearch(true)}
              disabled={showLoadingState}
            >
              <div className="flex items-center gap-2">
                {outputTokenInfo.image && (
                  <img
                    src={outputTokenInfo.image}
                    alt={outputTokenInfo.symbol || currentOutputToken}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
                  />
                )}
                <span>{outputTokenInfo.symbol || currentOutputToken}</span>
              </div>
              {isLoggedIn && (
                <span className="text-sm text-green-400">
                  {outputBalanceLoading ? '...' : `Current: ${outputBalance}`}
                </span>
              )}
            </button>
          </div>
        </div>

        {(quoteResponse || effectiveAmount) && !isFullyConfirmed && (
          <div className="space-y-3">
            {/* Expected Output Card */}
            <div className="bg-green-900/20 p-4 rounded-lg relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-green-400">You&apos;ll receive</p>
                  <div className="flex items-center gap-2">
                    {outputTokenInfo.image && (
                      <img
                        src={outputTokenInfo.image}
                        alt={outputTokenInfo.symbol || currentOutputToken}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <p className="text-xl font-semibold min-w-[120px]">
                      {isQuoteRefreshing ? (
                        <span className="text-green-400/70 animate-pulse">
                          {expectedOutput
                            ? parseFloat(expectedOutput).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )
                            : '0'}{' '}
                          {outputTokenInfo.symbol || currentOutputToken}
                        </span>
                      ) : quoteResponse ? (
                        `${parseFloat(expectedOutput).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )} ${outputTokenInfo.symbol || currentOutputToken}`
                      ) : (
                        `0 ${outputTokenInfo.symbol || currentOutputToken}`
                      )}
                    </p>
                  </div>
                  {isLoggedIn && !outputBalanceLoading && quoteResponse && (
                    <p className="text-sm text-green-400">
                      After swap:{' '}
                      {formatLargeNumber(
                        rawOutputBalance + parseFloat(expectedOutput || '0'),
                      )}{' '}
                      {outputTokenInfo.symbol || currentOutputToken}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-green-400">Rate</p>
                  <p className="text-sm min-w-[120px]">
                    {isQuoteRefreshing ? (
                      <span className="text-green-400/70 animate-pulse">
                        {`1 ${inputTokenInfo.symbol || currentInputToken} ≈ ${
                          quoteResponse
                            ? (
                                Number(quoteResponse.outAmount) /
                                Math.pow(10, outputTokenInfo.decimals ?? 9) /
                                (Number(quoteResponse.inAmount) /
                                  Math.pow(10, currentInputDecimals))
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : '0'
                        } ${outputTokenInfo.symbol || currentOutputToken}`}
                      </span>
                    ) : (
                      `1 ${inputTokenInfo.symbol || currentInputToken} ≈ ${
                        quoteResponse
                          ? (
                              Number(quoteResponse.outAmount) /
                              Math.pow(10, outputTokenInfo.decimals ?? 9) /
                              (Number(quoteResponse.inAmount) /
                                Math.pow(10, currentInputDecimals))
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '0'
                      } ${outputTokenInfo.symbol || currentOutputToken}`
                    )}
                  </p>
                </div>
              </div>

              {/* Only show route information when we have a quote */}
              <div className="bg-green-900/20 rounded-lg overflow-hidden mt-4">
                <button
                  onClick={() => setIsRouteInfoOpen(!isRouteInfoOpen)}
                  className="w-full p-3 flex items-center justify-between hover:bg-green-900/30 transition-colors"
                >
                  <span className="text-sm font-medium text-green-400">
                    Route Information & Swap Details
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
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
                  <div className="p-4 border-t border-green-900/20">
                    {isQuoteRefreshing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-400">
                            Platform Fee
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
                            Maximum Slippage
                          </span>
                          <span className="text-sm">{slippageBps / 100}%</span>
                        </div>
                      </div>
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

              {/* Settings Section */}
              <div className="space-y-4">
                {/* Slippage and Priority Settings Row */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {/* Slippage Setting */}
                  <div className="space-y-1">
                    <label className="text-sm text-green-400 block">
                      Slippage Tolerance
                    </label>
                    <select
                      className="bg-green-900/20 text-green-100 p-2 rounded w-full"
                      value={slippageBps}
                      onChange={(e) => setSlippageBps(Number(e.target.value))}
                      disabled={showLoadingState}
                    >
                      {SLIPPAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transaction Priority */}
                  {!isFullyConfirmed && (
                    <div className="space-y-1">
                      <label className="text-sm text-green-400 block">
                        Transaction Priority
                      </label>
                      <select
                        className="bg-green-900/20 text-green-100 p-2 rounded w-full"
                        value={priorityLevel}
                        onChange={(e) =>
                          setPriorityLevel(e.target.value as PriorityLevel)
                        }
                        disabled={showLoadingState}
                      >
                        {PRIORITY_LEVELS.map((level) => (
                          <option
                            key={level.value}
                            value={level.value}
                            title={level.description}
                          >
                            {level.label}{' '}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* SSE Fee Option */}
                <div className="flex items-center gap-4 p-4 bg-green-900/20 rounded-lg border border-green-400/20 hover:border-green-400/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="useSSEForFees"
                      checked={useSSEForFees}
                      onChange={(e) => {
                        setUseSSEForFees(e.target.checked)
                        resetQuoteState() // Reset quote when changing fee mode
                      }}
                      className="w-5 h-5 rounded bg-green-900/20 border-green-400 text-green-400 focus:ring-green-400"
                    />
                    {sseTokenInfo.image && (
                      <img
                        src={sseTokenInfo.image}
                        alt={sseTokenInfo.symbol || 'SSE'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="useSSEForFees"
                      className="text-sm text-green-100 flex items-center gap-2"
                    >
                      <span className="font-medium">
                        Pay fees with {sseTokenInfo.symbol || 'SSE'}
                      </span>
                      <div className="relative inline-block group">
                        <Info className="h-4 w-4 text-green-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-green-900/90 text-green-100 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity w-48 text-center pointer-events-none">
                          Get a 50% discount on transaction fees by paying with
                          SSE tokens
                        </div>
                      </div>
                    </label>
                    <p className="text-xs text-green-400/60 mt-1">
                      Enable to get 50% off on transaction fees
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Overlay */}
            {isQuoteRefreshing && (
              <div className="absolute inset-0 bg-green-900/20 rounded flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-green-400" />
              </div>
            )}
          </div>
        )}

        {!quoteResponse && effectiveAmount && isQuoteRefreshing && (
          <div className="bg-green-900/20 p-2 rounded text-center opacity-70">
            <span className="text-green-400 text-sm">
              Finding best route...
            </span>
          </div>
        )}

        {/* Swap Button */}
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
                    <span className="inline-flex ml-1">
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse animation-delay-200">
                        .
                      </span>
                      <span className="animate-pulse animation-delay-400">
                        .
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            ) : !isLoggedIn ? (
              <DynamicConnectButton>
                <div className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50 mt-2 w-full text-center cursor-pointer">
                  Connect Wallet to Swap
                </div>
              </DynamicConnectButton>
            ) : (
              <button
                onClick={handleSwap}
                disabled={showLoadingState}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50 mt-2 w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {txSignature
                        ? 'Confirming Transaction on Solana...'
                        : `Swapping ${currentInputToken} to ${currentOutputToken}...`}
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
          <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded">
            {error.includes('amount cannot be parsed')
              ? 'Please enter a valid amount'
              : error}
          </div>
        )}

        {txSignature && showTradeLink && (
          <SwapShareSection txSignature={txSignature} />
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
