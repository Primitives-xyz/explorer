import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useJupiterSwap } from '@/hooks/use-jupiter-swap'
import { SwapQuoteDetails } from './SwapQuoteDetails'
import { SwapShareSection } from './SwapShareSection'
import { PRIORITY_LEVELS, SLIPPAGE_OPTIONS } from '@/constants/jupiter'
import type { JupiterSwapFormProps, PriorityLevel } from '@/types/jupiter'

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

  const {
    loading,
    error,
    txSignature,
    priorityLevel,
    setPriorityLevel,
    priorityFee,
    estimatingFee,
    quoteResponse,
    expectedOutput,
    priceImpact,
    slippageBps,
    setSlippageBps,
    showTradeLink,
    handleSwap,
  } = useJupiterSwap({
    inputMint,
    outputMint,
    inputAmount,
    inputDecimals,
    sourceWallet,
  })

  return (
    <div className="p-4 bg-green-900/10 rounded-lg space-y-4">
      <div className="flex flex-col gap-2">
        <input
          type="number"
          placeholder="Amount"
          className="bg-green-900/20 text-green-100 p-2 rounded"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <select
            className="bg-green-900/20 text-green-100 p-2 rounded flex-1"
            value={inputMint}
            onChange={(e) => setInputMint(e.target.value)}
          >
            <option value={inputMint}>{inputTokenName}</option>
          </select>

          <span className="text-green-400">→</span>

          <select
            className="bg-green-900/20 text-green-100 p-2 rounded flex-1"
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
          >
            <option value={outputMint}>{outputTokenName}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-green-400">Slippage Tolerance:</label>
          <select
            className="bg-green-900/20 text-green-100 p-2 rounded"
            value={slippageBps}
            onChange={(e) => setSlippageBps(Number(e.target.value))}
          >
            {SLIPPAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {quoteResponse && (
          <div className="space-y-3">
            {/* Expected Output Card */}
            <div className="bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-green-400">
                    You&apos;ll receive approximately
                  </p>
                  <p className="text-xl font-semibold">
                    {expectedOutput} {outputTokenName}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-green-400">Rate</p>
                  <p className="text-sm">
                    1 {inputTokenName} ≈{' '}
                    {(Number(expectedOutput) / Number(inputAmount)).toFixed(6)}{' '}
                    {outputTokenName}
                  </p>
                </div>
              </div>
            </div>

            <SwapQuoteDetails
              quoteResponse={quoteResponse}
              priceImpact={priceImpact}
              slippageBps={slippageBps}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm text-green-400">
            Transaction Priority:
          </label>
          <select
            className="bg-green-900/20 text-green-100 p-2 rounded w-full"
            value={priorityLevel}
            onChange={(e) => setPriorityLevel(e.target.value as PriorityLevel)}
          >
            {PRIORITY_LEVELS.map((level) => (
              <option
                key={level.value}
                value={level.value}
                title={level.description}
              >
                {level.label}{' '}
                {priorityFee > 0 &&
                  level.value === priorityLevel &&
                  `(${priorityFee} µ◎)`}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSwap}
          disabled={loading || estimatingFee}
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Swapping...</span>
            </div>
          ) : (
            'Execute Swap'
          )}
        </button>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {txSignature && showTradeLink && (
          <SwapShareSection txSignature={txSignature} />
        )}
      </div>
    </div>
  )
}
