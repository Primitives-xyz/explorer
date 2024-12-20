import { formatNumber } from '@/utils/format'

const LAMPORTS_PER_SOL = 1000000000

interface SolBalanceSectionProps {
  walletAddress: string
  hasSearched?: boolean
  hideTitle?: boolean
  isLoading: boolean
  error: string | null
  nativeBalance?: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

export const SolBalanceSection = ({
  walletAddress,
  hasSearched,
  hideTitle = false,
  isLoading,
  error,
  nativeBalance,
}: SolBalanceSectionProps) => {
  const balance = nativeBalance
    ? nativeBalance.lamports / LAMPORTS_PER_SOL
    : null
  const solPrice = nativeBalance?.price_per_sol ?? null

  const shouldShowContent =
    isLoading || balance !== null || (hasSearched && balance === null)

  if (!shouldShowContent) return null

  const totalValue = balance && solPrice ? balance * solPrice : 0

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col h-[100px] relative group">
      {/* Header */}
      {!hideTitle && (
        <div className="border-b border-green-800 p-2 flex-shrink-0">
          <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
            <div className="text-green-500 text-sm font-mono whitespace-nowrap">
              {'>'} native_balance.sol
            </div>
            {balance !== null && solPrice !== null && (
              <div className="text-xs text-green-600 font-mono whitespace-nowrap ml-2">
                TOTAL: ${formatNumber(totalValue)} USDC
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span>! ERROR: {error}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-grow p-4 font-mono">
        {isLoading ? (
          <div className="text-center text-green-600">
            {'>>> FETCHING SOL BALANCE...'}
          </div>
        ) : balance === null ? (
          <div className="text-center text-green-600">
            {'>>> NO BALANCE FOUND'}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-green-400">
              <span className="text-green-600">{'>'}</span>{' '}
              {formatNumber(balance)} SOL
            </div>
            {solPrice && (
              <div className="text-green-600">
                ${formatNumber(solPrice)} / SOL
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
