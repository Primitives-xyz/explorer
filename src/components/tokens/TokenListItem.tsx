import { formatNumber } from '@/utils/format'
import { FungibleToken } from '@/utils/helius'

const truncateAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

interface TokenListItemProps {
  token: FungibleToken
  totalValue: number
  expandedTokenId: string | null
  onExpand: (id: string) => void
  onImageClick: (url: string, symbol: string) => void
}

export const TokenListItem = ({
  token,
  totalValue,
  expandedTokenId,
  onExpand,
  onImageClick,
}: TokenListItemProps) => {
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
              if (token.imageUrl) {
                onImageClick(token.imageUrl, token.symbol)
              }
            }}
          >
            <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm group-hover:bg-green-500/20 transition-all duration-300"></div>
            {token.imageUrl ? (
              <img
                src={token.imageUrl}
                alt={token.symbol}
                className="relative w-10 h-10 rounded-lg object-contain p-1.5 bg-black/40 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement?.classList.add(
                    'fallback-active',
                  )
                }}
              />
            ) : null}
            <div
              className={`relative w-10 h-10 rounded-lg bg-black/40 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300 flex items-center justify-center ${
                !token.imageUrl ? 'block' : 'hidden fallback'
              }`}
            >
              <span className="text-green-500 font-mono text-sm font-bold">
                {token.symbol.slice(0, 3)}
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-green-400 text-xs font-mono bg-black/60 px-1.5 py-0.5 rounded">
                [view]
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-green-300 font-mono bg-green-900/20 px-1.5 py-0.5 rounded inline-block truncate">
                {token.symbol}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-green-600/50 text-xs font-mono">
                  {truncateAddress(token.id)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(token.id)
                  }}
                  className="text-green-600/50 hover:text-green-400/80 text-xs font-mono bg-green-900/20 px-1.5 py-0.5 rounded transition-colors"
                >
                  [copy]
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Token Details */}
        <div className="space-y-1 bg-green-900/5 p-2 rounded text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-green-600">Balance:</span>
                <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                  {formatNumber(token.balance)}
                </span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-green-600">Value:</span>
                <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                  ${formatNumber(token.balance * (token.price || 0))}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-green-600">Price:</span>
                <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                  ${formatNumber(token.price || 0)}
                </span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-green-600">Share:</span>
                <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                  {(
                    (token.balance * (token.price || 0) * 100) /
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
            <div className="space-y-1">
              <span className="text-green-600">Token Address:</span>
              <div className="text-green-500 bg-green-900/20 px-2 py-1 rounded font-mono text-xs break-all">
                {token.id}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
