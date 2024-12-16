import { FungibleToken as BaseFungibleToken } from '../types'

// Create an extended type that allows null
interface ExtendedFungibleToken extends Omit<BaseFungibleToken, 'imageUrl'> {
  imageUrl: string | null | undefined
}

interface TokenSectionProps {
  tokens: ExtendedFungibleToken[]
  totalValue: number
  isLoading?: boolean
  hasSearched?: boolean
}

export const TokenSection = ({
  tokens,
  totalValue,
  isLoading,
  hasSearched,
}: TokenSectionProps) => {
  const shouldShowContent =
    isLoading || tokens.length > 0 || (hasSearched && tokens.length === 0)

  if (!shouldShowContent) return null

  return (
    <div className="border border-green-800 bg-black/50">
      {/* Header */}
      <div className="border-b border-green-800 p-2">
        <div className="flex justify-between items-center">
          <div className="text-green-500 text-sm font-mono">
            {'>'} token_balances.sol
          </div>
          <div className="text-xs text-green-600 font-mono">
            TOTAL: ${totalValue.toFixed(2)} USDC
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="divide-y divide-green-800/30">
        {isLoading ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> FETCHING TOKENS...'}
          </div>
        ) : hasSearched && tokens.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO TOKENS FOUND'}
          </div>
        ) : (
          tokens.map((token) => (
            <div key={token.id} className="p-3 hover:bg-green-900/10">
              <div className="flex flex-col gap-2">
                {/* Token Header */}
                <div className="flex items-center gap-3">
                  {token.imageUrl && (
                    <img
                      src={token.imageUrl}
                      alt=""
                      className="w-8 h-8 rounded-sm opacity-80 bg-green-900/20 p-1"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-green-300 font-mono bg-green-900/20 px-1.5 py-0.5 rounded inline-block">
                      {token.symbol}
                    </div>
                  </div>
                </div>

                {/* Token Details */}
                <div className="space-y-1 bg-green-900/5 p-2 rounded text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">Balance:</span>
                    <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                      {token.balance.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">Value:</span>
                    <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                      ${(token.balance * (token.price || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
