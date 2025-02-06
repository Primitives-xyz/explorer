import { useEffect, useState } from 'react'
import { formatNumber, shortenAddress } from '@/utils/format'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { WalletFollowButton } from '../profile/wallet-follow-button'
import Link from 'next/link'

interface TokenHolder {
  address: string
  amount: string
  uiAmountString: string
}

interface LargestHoldersProps {
  mintAddress: string
  totalSupply: number
}

// Simple fetch function
async function fetchHolders(mintAddress: string): Promise<TokenHolder[]> {
  const response = await fetch(
    `/api/tokens/largest-holders?mintAddress=${mintAddress}`,
  )
  if (!response.ok) {
    throw new Error('Failed to fetch holders')
  }
  const data = await response.json()
  return data.holders || []
}

// Simplified holder row component
const HolderRow = ({
  holder,
  index,
  totalSupply,
}: {
  holder: TokenHolder
  index: number
  totalSupply: number
}) => {
  const { walletAddress } = useCurrentWallet()
  const isCurrentWallet = walletAddress === holder.address
  const percentage = (Number(holder.uiAmountString) / totalSupply) * 100
  const holdingValue = Number(holder.uiAmountString)

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-green-900/10 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-6 text-center font-mono ${
            index < 3 ? 'text-green-400' : 'text-green-500/60'
          }`}
        >
          {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/wallet/${holder.address}`}
            className="font-mono text-green-400 text-sm min-w-[120px] truncate hover:text-green-300 transition-colors"
          >
            {isCurrentWallet ? 'Your Wallet' : shortenAddress(holder.address)}
          </Link>
          <WalletFollowButton walletAddress={holder.address} size="sm" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right min-w-[100px]">
          <div className="text-green-400 font-mono">
            {formatNumber(holdingValue)}
          </div>
          <div className="text-green-500/60 text-xs">
            {percentage.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}

export function LargestHolders({
  mintAddress,
  totalSupply,
}: LargestHoldersProps) {
  const [holders, setHolders] = useState<TokenHolder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadHolders = async () => {
      try {
        setIsLoading(true)
        const data = await fetchHolders(mintAddress)
        if (isMounted) {
          setHolders(data)
        }
      } catch (error) {
        console.error('Error fetching token holders:', error)
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : 'Failed to fetch holders',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHolders()
    return () => {
      isMounted = false
    }
  }, [mintAddress])

  const content = isLoading ? (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ) : error ? (
    <div className="flex items-center justify-center h-full p-4 text-red-400 text-sm">
      <span className="text-red-500">⚠️</span> {error}
    </div>
  ) : (
    <div className="h-full overflow-y-auto divide-y divide-green-800/30">
      {holders.map((holder, index) => (
        <HolderRow
          key={holder.address}
          holder={holder}
          index={index}
          totalSupply={totalSupply}
        />
      ))}
    </div>
  )

  return <div className="h-[350px]">{content}</div>
}
