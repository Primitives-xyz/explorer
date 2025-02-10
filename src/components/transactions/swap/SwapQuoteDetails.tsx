import type { QuoteResponse } from '@/types/jupiter'
import { PLATFORM_FEE_BPS } from '@/constants/jupiter'

interface SwapQuoteDetailsProps {
  quoteResponse: QuoteResponse
  priceImpact: string | null
  slippageBps: number
  useSSEForFees?: boolean
  sseFeeAmount?: string
}

export function SwapQuoteDetails({
  quoteResponse,
  priceImpact,
  slippageBps,
  useSSEForFees,
  sseFeeAmount,
}: SwapQuoteDetailsProps) {
  // Calculate fees based on USD value
  const swapValueUSDC = Number(quoteResponse.swapUsdValue ?? '0')
  const platformFeeUSDC = swapValueUSDC * (PLATFORM_FEE_BPS / 10000) // 1% of USD value
  const sseFee = sseFeeAmount ? Number(sseFeeAmount) / Math.pow(10, 6) : 0

  // Format price impact to be more concise
  const formatPriceImpact = (impact: string | null) => {
    if (!impact) return '0%'
    const num = Number(impact)
    if (num < 0.01) return '< 0.01%'
    return num.toFixed(2) + '%'
  }

  // Format USDC amounts to be more concise
  const formatUSDC = (amount: number) => {
    if (amount < 0.01) return '< $0.01'
    return '$' + amount.toFixed(2)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-green-400">Platform Fee</span>
        <div className="text-right">
          {useSSEForFees ? (
            <div className="flex flex-col items-end">
              <span className="text-sm line-through text-green-400/50">
                {formatUSDC(platformFeeUSDC)} ({PLATFORM_FEE_BPS / 100}%)
              </span>
              <span className="text-sm text-green-400">
                {sseFee.toFixed(2)} SSE ({PLATFORM_FEE_BPS / 200}%)
              </span>
            </div>
          ) : (
            <span className="text-sm">
              {formatUSDC(platformFeeUSDC)} ({PLATFORM_FEE_BPS / 100}%)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-green-400">Price Impact</span>
        <span
          className={`text-sm ${Number(priceImpact) > 1 ? 'text-red-400' : ''}`}
        >
          {formatPriceImpact(priceImpact)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-green-400">Maximum Slippage</span>
        <span className="text-sm">{slippageBps / 100}%</span>
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
  )
}
