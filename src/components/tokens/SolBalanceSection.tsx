import type { TokenPortfolioResponse } from '@/types/Token'
import { formatNumber } from '@/utils/format'

interface PortfolioBalanceSectionProps {
  hideTitle?: boolean
  isLoading: boolean
  error?: string

  portfolioData?: TokenPortfolioResponse
}

export const PortfolioBalanceSection = ({
  hideTitle = false,
  isLoading,
  error,
  portfolioData,
}: PortfolioBalanceSectionProps) => {
  const { items, totalUsd } = portfolioData?.data || { items: [], totalUsd: 0 }

  // Find SOL token data
  const solToken = items.find((item) => item.symbol === 'SOL')
  const solBalance = solToken?.uiAmount ?? 0
  const solValue = solToken?.valueUsd ?? 0

  // Calculate other tokens
  const tokenCount = items.length - 1 // Subtract SOL
  const otherTokensValue = totalUsd - solValue

  const shouldShowContent = isLoading || portfolioData?.data

  if (!shouldShowContent) return null

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col h-[200px] relative group">
      {/* Header */}
      {!hideTitle && (
        <div className="border-b border-green-800 p-3 flex-shrink-0 bg-black/30">
          <div className="text-green-500 text-sm font-mono whitespace-nowrap">
            {'>'} portfolio_balance
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span>! ERROR: {error}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-grow p-6 font-mono">
        {isLoading ? (
          <div className="flex flex-col space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline space-x-2">
                <div className="h-6 w-32 bg-green-800/30 rounded"></div>
              </div>
              <div className="h-5 w-24 bg-green-800/30 rounded"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-green-800/30 rounded"></div>
              <div className="h-5 w-28 bg-green-800/30 rounded"></div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-green-800">
              <div className="text-green-600/50">TOTAL</div>
              <div className="h-5 w-28 bg-green-800/30 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-green-400">
                {formatNumber(solBalance)} SOL
              </span>
              <span className="text-green-600">${formatNumber(solValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-400">{tokenCount} Tokens</span>
              <span className="text-green-600">
                ${formatNumber(otherTokensValue)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-green-800">
              <span className="text-green-400">Total</span>
              <span className="text-green-600">${formatNumber(totalUsd)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
