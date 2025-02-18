import { useTokenInfo } from '@/hooks/use-token-info'
import type { FungibleTokenInfo, TokenResponse } from '@/types/Token'
import { formatNumber } from '@/utils/format'
import type { Transaction } from '@/utils/helius/types'
import { route } from '@/utils/routes'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Avatar } from '@/components/common/avatar'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import type { Profile } from '@/utils/api'
import { formatTimeAgo } from '@/utils/format-time'
import { TransactionBadge } from './transaction-badge'

// Legacy format
interface TokenTransferLegacy {
  tokenMint: string
  from: string
  to: string
  amount: number
}

// New format from Helius
interface TokenTransferHelius {
  fromTokenAccount: string
  toTokenAccount: string
  fromUserAccount: string
  toUserAccount: string
  tokenAmount: number
  mint: string
  tokenStandard: string
}

type TokenTransfer = TokenTransferLegacy | TokenTransferHelius

interface SPLTransferViewProps {
  tx: Transaction
  sourceWallet: string
}

// Helper function to check if token transfer is Helius format
const isHeliusFormat = (
  transfer: TokenTransfer
): transfer is TokenTransferHelius => {
  return 'mint' in transfer && 'fromUserAccount' in transfer
}

// Helper function to normalize token transfer data
const normalizeTokenTransfer = (transfer: TokenTransfer) => {
  if (isHeliusFormat(transfer)) {
    return {
      mint: transfer.mint,
      amount: transfer.tokenAmount,
      from: transfer.fromUserAccount,
      to: transfer.toUserAccount,
    }
  }
  return {
    mint: transfer.tokenMint,
    amount: transfer.amount,
    from: transfer.from,
    to: transfer.to,
  }
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

// Helper function to detect comment commission
const isCommentCommission = (transfers: TokenTransfer[]) => {
  if (transfers.length !== 2) return false

  const normalized = transfers.map(normalizeTokenTransfer)
  const commissionWallet = '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'

  return (
    normalized.some((t) => t.to === commissionWallet && t.amount === 20) &&
    normalized.some((t) => t.to !== commissionWallet && t.amount === 80)
  )
}

export const SPLTransferView = ({ tx, sourceWallet }: SPLTransferViewProps) => {
  const t = useTranslations()
  const tokenMint = isHeliusFormat(tx.tokenTransfers?.[0])
    ? tx.tokenTransfers[0].mint
    : tx.tokenTransfers?.[0]?.tokenMint
  const { data: tokenInfo, loading } = useTokenInfo(tokenMint)

  // Add profile lookup for source wallet
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: Profile) => p.namespace.name === 'nemoapp'
  )?.profile

  if (!tx.tokenTransfers?.length) {
    return null
  }

  return (
    <div className="space-y-2 p-4 bg-green-900/5 hover:bg-green-900/10 transition-colors rounded-xl border border-green-800/10">
      {/* Transaction Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Avatar
              username={sourceProfile?.username || sourceWallet}
              size={32}
              imageUrl={sourceProfile?.image}
            />
            <span className="text-gray-300">
              {sourceProfile?.username ? (
                sourceProfile.username === sourceWallet ? (
                  <span className="font-mono">
                    {sourceWallet.slice(0, 4)}...{sourceWallet.slice(-4)}
                  </span>
                ) : (
                  `@${sourceProfile.username}`
                )
              ) : (
                <span className="font-mono">
                  {sourceWallet.slice(0, 4)}...{sourceWallet.slice(-4)}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>transferred tokens</span>
            <Link
              href={route('address', { id: tx.signature })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              • {formatTimeAgo(new Date(tx.timestamp))}
            </Link>
            <span className="text-gray-500">•</span>
            <TransactionBadge type={tx.type} source={tx.source} />
          </div>
        </div>
      </div>

      {/* Existing transfer details */}
      {tx.tokenTransfers.map((transfer: TokenTransfer, index: number) => {
        const normalized = normalizeTokenTransfer(transfer)
        const tokenSymbol =
          tokenInfo?.result.content.metadata.symbol || 'tokens'
        const pricePerToken = isFungibleToken(tokenInfo)
          ? tokenInfo.result.token_info?.price_info?.price_per_token
          : undefined
        const totalValue = pricePerToken
          ? normalized.amount * pricePerToken
          : null
        const isReceiving = normalized.to === sourceWallet

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
                    <span className=" font-semibold">
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
                      isReceiving ? '' : 'text-red-500'
                    }`}
                  >
                    {isReceiving
                      ? t('transaction_log.received')
                      : t('transaction_log.sent')}
                  </span>
                  <span className=" font-mono text-sm">{tokenSymbol}</span>
                </div>
                <span className="/60 font-mono text-xs">
                  {isReceiving ? (
                    <>
                      {t('transaction_log.from')}:{' '}
                      <Link
                        href={route('address', { id: normalized.from })}
                        className="hover: transition-colors"
                      >
                        {normalized.from?.slice(0, 4)}...
                        {normalized.from?.slice(-4)}
                      </Link>
                    </>
                  ) : (
                    <>
                      {t('transaction_log.to')}:{' '}
                      <Link
                        href={route('address', { id: normalized.to })}
                        className="hover: transition-colors"
                      >
                        {normalized.to?.slice(0, 4)}...
                        {normalized.to?.slice(-4)}
                      </Link>
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className=" font-mono font-medium">
                  {formatNumber(normalized.amount)} {tokenSymbol}
                </span>
                {totalValue && (
                  <span className="/60 font-mono text-xs">
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
