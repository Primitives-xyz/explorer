import { useTokenInfo } from '@/hooks/use-token-info'
import type { FungibleTokenInfo, TokenResponse } from '@/types/Token'
import { formatNumber } from '@/utils/format'
import type { Transaction } from '@/utils/helius/types'
import { route } from '@/utils/routes'
import Link from 'next/link'

interface TokenTransfer {
  tokenMint: string
  from: string
  to: string
  amount: number
}

interface SPLTransferViewProps {
  tx: Transaction
  sourceWallet: string
}

// Helper function to check if token is fungible
const isFungibleToken = (
  data: TokenResponse | null
): data is TokenResponse & { result: FungibleTokenInfo } => {
  return (
    data?.result?.interface === 'FungibleToken' ||
    data?.result?.interface === 'FungibleAsset'
  )
}

export const SPLTransferView = ({ tx, sourceWallet }: SPLTransferViewProps) => {
  const tokenMint = tx.tokenTransfers?.[0]?.tokenMint
  const { data: tokenInfo, loading } = useTokenInfo(tokenMint)

  if (!tx.tokenTransfers?.length) {
    return null
  }

  return (
    <div className="space-y-2 p-4 bg-green-900/5 hover:bg-green-900/10 transition-colors rounded-xl border border-green-800/10">
      {tx.tokenTransfers.map((transfer: TokenTransfer, index: number) => {
        const tokenSymbol =
          tokenInfo?.result.content.metadata.symbol || 'tokens'
        const pricePerToken = isFungibleToken(tokenInfo)
          ? tokenInfo.result.token_info?.price_info?.price_per_token
          : undefined
        const totalValue = pricePerToken
          ? transfer.amount * pricePerToken
          : null
        const isReceiving = transfer.to === sourceWallet

        return (
          <div key={index} className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/5 rounded-xl filter blur-sm"></div>
              <div className="w-12 h-12 rounded-xl bg-black/20 ring-1 ring-green-500/10 flex items-center justify-center relative z-[1]">
                {loading ? (
                  <div className="animate-pulse w-8 h-8 bg-green-500/20 rounded-lg" />
                ) : tokenInfo?.result.content.links?.image ? (
                  <img
                    src={tokenInfo.result.content.links.image}
                    alt={tokenSymbol}
                    className="w-8 h-8 rounded-lg object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500 font-semibold">
                      {tokenSymbol.slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      isReceiving ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {isReceiving ? 'Received' : 'Sent'}
                  </span>
                  <span className="text-green-600 font-mono text-sm">
                    {tokenSymbol}
                  </span>
                </div>
                <span className="text-green-600/60 font-mono text-xs">
                  {isReceiving ? (
                    <>
                      From:{' '}
                      <Link
                        href={`/portfolio/${transfer.from}`}
                        className="hover:text-green-500 transition-colors"
                      >
                        {transfer.from?.slice(0, 4)}...
                        {transfer.from?.slice(-4)}
                      </Link>
                    </>
                  ) : (
                    <>
                      To:{' '}
                      <Link
                        href={route('address', { id: transfer.to })}
                        className="hover:text-green-500 transition-colors"
                      >
                        {transfer.to?.slice(0, 4)}...{transfer.to?.slice(-4)}
                      </Link>
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className="text-green-400 font-mono font-medium">
                  {formatNumber(transfer.amount)} {tokenSymbol}
                </span>
                {totalValue && (
                  <span className="text-green-600/60 font-mono text-xs">
                    ≈ ${formatNumber(totalValue, 2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
