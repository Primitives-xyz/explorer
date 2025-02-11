import type { TokenInfo } from '@/types/Token'
import { ArrowLeftRight } from 'lucide-react'

interface TokenSelectButtonProps {
  tokenInfo: {
    data: TokenInfo | null
    symbol?: string
    name?: string
    image?: string
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
      className="bg-green-900/20 text-green-100 p-3 rounded-lg w-full text-left flex items-center justify-between hover:bg-green-900/30 transition-colors group"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center gap-3">
        {tokenInfo.image && (
          <img
            src={tokenInfo.image}
            alt={tokenInfo.symbol || currentToken}
            className="w-7 h-7 rounded-full"
          />
        )}
        <div>
          <div className="font-medium">{tokenInfo.symbol || currentToken}</div>
          {isLoggedIn && (
            <div className="text-sm text-green-500">
              {isBalanceLoading ? '...' : balance}
            </div>
          )}
        </div>
      </div>
      <div className="opacity-50 group-hover:opacity-100 transition-opacity">
        <ArrowLeftRight className="h-4 w-4 rotate-90" />
      </div>
    </button>
  )
}
