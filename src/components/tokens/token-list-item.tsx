import { formatNumber, formatTokenBalance } from '@/utils/format'
import type { FungibleToken } from '@/utils/types'
import { route } from '@/utils/routes'
import { useRouter } from 'next/navigation'
import { TokenAddress } from './token-address'

interface TokenListItemProps {
  token: FungibleToken
  totalValue: number
  expandedTokenId: string | null
  onExpand: (id: string) => void
  onImageClick: (token: FungibleToken) => void
}

export const TokenListItem = ({
  token,
  totalValue,
  expandedTokenId,
  onExpand,
  onImageClick,
}: TokenListItemProps) => {
  const router = useRouter()

  return (
    <div
      className="p-3 hover:bg-green-900/10 cursor-pointer transition-colors"
      onClick={() => onExpand(token.id)}
    >
      <div className="flex flex-col gap-2 overflow-hidden">
        {/* Token Header */}
        <div className="flex items-center gap-3">
          <div
            className="relative group cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              if (token) {
                onImageClick(token)
              }
            }}
          >
            <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm group-hover:bg-green-500/20 transition-all duration-300"></div>

            {/* Image container */}
            {token.imageUrl && (
              <div className="relative inline-block">
                <img
                  src={token.imageUrl}
                  alt={token.symbol}
                  className="w-10 h-10 rounded-lg object-contain p-1.5 bg-black/40 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement?.parentElement?.classList.add(
                      'fallback-active'
                    )
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className=" text-xs font-mono bg-black/60 px-1.5 py-0.5 rounded">
                    [view]
                  </span>
                </div>
              </div>
            )}

            {/* Fallback container */}
            <div
              className={`w-10 h-10 rounded-lg bg-black/40 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300 flex items-center justify-center ${
                !token.imageUrl ? 'block' : 'hidden fallback'
              }`}
            >
              <span className=" font-mono text-sm font-bold">
                {token.symbol.slice(0, 3)}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(route('address', { id: token.id }))
                }}
                className=" font-mono bg-green-900/20 px-1.5 py-0.5 rounded inline-block truncate hover: transition-colors"
              >
                {token.symbol}
              </button>
              <TokenAddress address={token.id} />
            </div>
          </div>
        </div>

        {/* Token Details */}
        <div className="space-y-1 bg-green-900/5 p-2 rounded text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="">Balance:</span>
                <span className=" bg-green-900/20 px-1.5 py-0.5 rounded">
                  {formatNumber(formatTokenBalance(token.balance, token.decimals))}
                </span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="">Value:</span>
                <span className=" bg-green-900/20 px-1.5 py-0.5 rounded">
                  ${formatNumber(formatTokenBalance(token.balance, token.decimals) * (token.price || 0))}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="">Price:</span>
                <span className=" bg-green-900/20 px-1.5 py-0.5 rounded">
                  ${formatNumber(token.price || 0)}
                </span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="">Share:</span>
                <span className=" bg-green-900/20 px-1.5 py-0.5 rounded">
                  {(
                    (formatTokenBalance(token.balance, token.decimals) * (token.price || 0) * 100) /
                    totalValue
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expandedTokenId === token.id && (
          <div className="mt-2 space-y-2 bg-green-900/10 p-3 rounded text-xs font-mono">
            <div className=" bg-green-900/20 px-2 py-1 rounded font-mono text-xs break-all">
              <TokenAddress address={token.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
