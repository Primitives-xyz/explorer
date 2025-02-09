import { useState } from 'react'
import { Loader2, ArrowLeftRight, Info } from 'lucide-react'
import { useJupiterSwap } from '@/hooks/use-jupiter-swap'
import { useTokenInfo } from '@/hooks/use-token-info'
import { SwapQuoteDetails } from './SwapQuoteDetails'
import { SwapShareSection } from './SwapShareSection'
import { PRIORITY_LEVELS, SLIPPAGE_OPTIONS } from '@/constants/jupiter'
import type { JupiterSwapFormProps, PriorityLevel } from '@/types/jupiter'

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
  initialOutputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  initialAmount = '',
  inputTokenName = 'SOL',
  outputTokenName = 'USDC',
  inputDecimals = 9,
  sourceWallet,
}: JupiterSwapFormProps) {
  const [inputAmount, setInputAmount] = useState(initialAmount)
  const [inputMint, setInputMint] = useState(initialInputMint)
  const [outputMint, setOutputMint] = useState(initialOutputMint)
  const [currentInputToken, setCurrentInputToken] = useState(inputTokenName)
  const [currentOutputToken, setCurrentOutputToken] = useState(outputTokenName)
  const [isRouteInfoOpen, setIsRouteInfoOpen] = useState(false)
  const [useSSEForFees, setUseSSEForFees] = useState(false)

  // Add token info hooks
  const inputTokenInfo = useTokenInfo(inputMint)
  const outputTokenInfo = useTokenInfo(outputMint)
  const sseTokenInfo = useTokenInfo(SSE_MINT)

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
    inputAmount,
    inputDecimals,
    sourceWallet,
    platformFeeBps: useSSEForFees ? 0 : undefined, // Set to 0 when using SSE for fees
  })

  const handleSwapDirection = () => {
    // Reset all quote-related state first
    resetQuoteState()
    setInputAmount('')

    // Then swap the tokens
    setInputMint(outputMint)
    setOutputMint(inputMint)
    setCurrentInputToken(currentOutputToken)
    setCurrentOutputToken(currentInputToken)
  }

  // Show loading overlay when refreshing quote
  const showLoadingState = loading || isQuoteRefreshing

  return (
    <div className="p-4 bg-green-900/10 rounded-lg space-y-4">
      <div className="flex flex-col gap-2">
        <input
          type="number"
          placeholder="Amount"
          className="bg-green-900/20 text-green-100 p-2 rounded"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          disabled={showLoadingState || isFullyConfirmed}
        />

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <select
              className="bg-green-900/20 text-green-100 p-2 pl-10 rounded w-full appearance-none"
              value={inputMint}
              onChange={(e) => setInputMint(e.target.value)}
              disabled={showLoadingState || isFullyConfirmed}
            >
              <option value={inputMint}>
                {inputTokenInfo.symbol || currentInputToken}
              </option>
            </select>
            {inputTokenInfo.image && (
              <img
                src={inputTokenInfo.image}
                alt={inputTokenInfo.symbol || currentInputToken}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
              />
            )}
          </div>

          <button
            onClick={handleSwapDirection}
            disabled={showLoadingState || isFullyConfirmed}
            className="bg-green-900/20 hover:bg-green-900/30 p-2 rounded-full transition-colors"
            title="Swap direction"
          >
            <ArrowLeftRight className="h-4 w-4 text-green-400" />
          </button>

          <div className="flex-1 relative">
            <select
              className="bg-green-900/20 text-green-100 p-2 pl-10 rounded w-full appearance-none"
              value={outputMint}
              onChange={(e) => setOutputMint(e.target.value)}
              disabled={showLoadingState || isFullyConfirmed}
            >
              <option value={outputMint}>
                {outputTokenInfo.symbol || currentOutputToken}
              </option>
            </select>
            {outputTokenInfo.image && (
              <img
                src={outputTokenInfo.image}
                alt={outputTokenInfo.symbol || currentOutputToken}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
              />
            )}
          </div>
        </div>

        {(quoteResponse || (inputAmount && isQuoteRefreshing)) &&
          !isFullyConfirmed && (
            <div className="space-y-3">
              {/* Expected Output Card */}
              <div className="bg-green-900/20 p-4 rounded-lg relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-green-400">
                      You&apos;ll receive approximately
                    </p>
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
                          <span className="text-green-400/70">
                            Updating
                            <LoadingDots />
                          </span>
                        ) : (
                          `${expectedOutput} ${
                            outputTokenInfo.symbol || currentOutputToken
                          }`
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-green-400">Rate</p>
                    <p className="text-sm min-w-[120px]">
                      {isQuoteRefreshing ? (
                        <span className="text-green-400/70">
                          Updating
                          <LoadingDots />
                        </span>
                      ) : (
                        `1 ${inputTokenInfo.symbol || currentInputToken} ≈ ${(
                          Number(expectedOutput) / Number(inputAmount)
                        ).toFixed(6)} ${
                          outputTokenInfo.symbol || currentOutputToken
                        }`
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
                            <span className="text-sm">
                              {slippageBps / 100}%
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
                        disabled={showLoadingState || isFullyConfirmed}
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
                            Get a 50% discount on transaction fees by paying
                            with SSE tokens
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

        {!quoteResponse && inputAmount && (
          <div className="bg-green-900/20 p-2 rounded text-center">
            <span className="text-green-500/50">
              Fetching quote
              <LoadingDots />
            </span>
          </div>
        )}

        {/* Swap Button */}
        {!isFullyConfirmed && (
          <button
            onClick={handleSwap}
            disabled={showLoadingState}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50 mt-2"
          >
            {showLoadingState ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {txSignature ? 'Confirming Transaction...' : 'Swapping...'}
                </span>
              </div>
            ) : txSignature ? (
              'Finalizing Swap...'
            ) : (
              'Execute Swap'
            )}
          </button>
        )}

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {txSignature && showTradeLink && (
          <SwapShareSection txSignature={txSignature} />
        )}
      </div>
    </div>
  )
}
