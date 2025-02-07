import { useState } from 'react'
import type { QuoteResponse } from '@/types/jupiter'
import { PLATFORM_FEE_BPS } from '@/constants/jupiter'

interface SwapQuoteDetailsProps {
  quoteResponse: QuoteResponse | null
  priceImpact: string
  slippageBps: number
}

export function SwapQuoteDetails({
  quoteResponse,
  priceImpact,
  slippageBps,
}: SwapQuoteDetailsProps) {
  const [isQuoteDetailsOpen, setIsQuoteDetailsOpen] = useState(false)

  if (!quoteResponse) return null

  return (
    <div className="bg-green-900/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsQuoteDetailsOpen(!isQuoteDetailsOpen)}
        className="w-full p-3 flex items-center justify-between hover:bg-green-900/30 transition-colors"
      >
        <span className="text-sm font-medium">Swap Details</span>
        <svg
          className={`w-5 h-5 transition-transform ${
            isQuoteDetailsOpen ? 'rotate-180' : ''
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

      {isQuoteDetailsOpen && (
        <div className="p-3 space-y-2 border-t border-green-900/30">
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Price Impact</span>
            <span
              className={`flex items-center gap-1 ${
                Number(priceImpact) > 1
                  ? 'text-red-400'
                  : Number(priceImpact) > 0.5
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}
            >
              {Number(priceImpact) > 1 && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              {Number(priceImpact).toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-green-400">Platform Fee</span>
            <span>{(PLATFORM_FEE_BPS / 100).toFixed(2)}%</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-green-400">Slippage Tolerance</span>
            <span>{(slippageBps / 100).toFixed(2)}%</span>
          </div>

          {quoteResponse.routePlan && (
            <div className="pt-2 border-t border-green-900/30">
              <p className="text-sm text-green-400 mb-1">Route</p>
              <div className="text-xs space-y-1">
                {quoteResponse.routePlan.map((step, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span>{step.swapInfo.label}</span>
                    {index < (quoteResponse?.routePlan?.length ?? 0) - 1 && (
                      <span>→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
