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
    <section className="border border-green-800 p-2">
      <div className="flex justify-between text-xs text-green-600 mb-2">
        <span>== TOKENS ==</span>
        <span>TOTAL: ${totalValue.toFixed(2)} USDC</span>
      </div>
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
          <div
            key={token.id}
            className="mb-2 last:mb-0 border-t border-green-900/50 pt-2"
          >
            <div className="flex items-center gap-2">
              {token.imageUrl && (
                <img
                  src={token.imageUrl}
                  alt=""
                  className="w-6 h-6 rounded-sm opacity-80"
                />
              )}
              <div className="flex-1">
                <div className="text-green-300">{token.symbol}</div>
                <div className="text-xs text-green-600">
                  Balance: {token.balance.toFixed(4)} | Value: $
                  {(token.balance * (token.price || 0)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  )
}
