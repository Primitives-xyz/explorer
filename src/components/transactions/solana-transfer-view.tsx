import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/avatar'
import type { Profile } from '@/utils/api'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { formatNumber } from '@/utils/format'
import { formatTimeAgo } from '@/utils/format-time'
import type { Transaction } from '@/utils/helius/types'
import { route } from '@/utils/routes'
import Image from 'next/image'
import Link from 'next/link'
import { TransactionBadge } from './transaction-badge'

interface Transfer {
  from: string
  to: string
  amount: number
}

interface SolanaTransferViewProps {
  tx: Transaction & {
    transfers?: Transfer[]
  }
  sourceWallet: string
}

const formatSOL = (sol: number) => {
  // Convert to string with appropriate precision
  const str = sol < 0.001 ? sol.toFixed(6) : sol.toFixed(4)
  // Remove trailing zeros after decimal point
  return str.replace(/\.?0+$/, '')
}

const formatUSD = (sol: number) => {
  const usd = sol * 20 // Assuming $20 per SOL
  if (usd < 0.01) {
    return '< $0.01'
  }
  return `$${usd.toFixed(2)}`
}

export const SolanaTransferView = ({
  tx,
  sourceWallet,
}: SolanaTransferViewProps) => {
  // Add profile lookup for source wallet
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: Profile) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  const amount = tx.nativeTransfers?.[0]?.amount || 0

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
            <span>transferred SOL</span>
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

      {/* Transfer Details */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
          <div className="w-10 h-10 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
            <Image
              src="/images/solana-icon.svg"
              alt="solana icon"
              width={24}
              height={24}
              className="group-hover:scale-110 transition-transform"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-red-400 text-sm">-</span>
            <span className="font-mono text-lg">{formatNumber(amount)}</span>
            <span className="font-mono text-base text-gray-400">SOL</span>
          </div>
        </div>
      </div>
    </div>
  )
}
