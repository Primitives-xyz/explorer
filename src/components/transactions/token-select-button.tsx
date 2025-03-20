import type { TokenResponse } from '@/types/Token'
import { ArrowLeftRight } from 'lucide-react'

interface TokenSelectButtonProps {
  tokenInfo: {
    data?: TokenResponse
    loading: boolean
    error: any
    symbol?: string
    name?: string
    image?: string
    decimals?: number
  }
  currentToken: string
  balance?: string
  isBalanceLoading?: boolean
  isLoggedIn?: boolean
  disabled?: boolean
  onClick: () => void
}

export function TokenSelectButton({
  tokenInfo,
  currentToken,
  balance,
  isBalanceLoading,
  isLoggedIn,
  disabled,
  onClick,
}: TokenSelectButtonProps) {
  return (
    <button
      className="bg-green-900/20 p-2 sm:p-3 rounded-lg w-full text-left flex items-center justify-between hover:bg-green-900/30 transition-colors group"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {tokenInfo.image && (
          <img
            src={tokenInfo.image}
            alt={tokenInfo.symbol || currentToken}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
          />
        )}
        <div>
          <div className="text-sm sm:text-base font-medium">
            {tokenInfo.symbol || currentToken}
          </div>
          {isLoggedIn && (
            <div className="text-xs sm:text-sm text-green-100/70">
              {isBalanceLoading ? '...' : balance}
            </div>
          )}
        </div>
      </div>
      <div className="opacity-50 group-hover:opacity-100 transition-opacity">
        <ArrowLeftRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-90" />
      </div>
    </button>
  )
}
