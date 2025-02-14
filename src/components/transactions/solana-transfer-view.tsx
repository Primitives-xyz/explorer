import type { Transaction } from '@/utils/helius/types'
import { route } from '@/utils/routes'
import Image from 'next/image'
import Link from 'next/link'

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

export function SolanaTransferView({
  tx,
  sourceWallet,
}: SolanaTransferViewProps) {
  const transfers =
    tx.transfers?.filter((transfer: Transfer) => transfer.amount > 0) || []

  if (!transfers.length) return null

  return (
    <div className="space-y-2 p-3 bg-green-900/10 rounded-lg border border-green-800/20">
      {transfers.map((transfer: Transfer, index: number) => (
        <div key={index} className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
            <div className="w-10 h-10 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
              <Image
                src="/images/solana-icon.svg"
                alt="solana icon"
                width={24}
                height={24}
              />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-between">
            <div className="flex flex-col">
              <span className=" font-mono text-sm">
                {transfer.from === sourceWallet ? 'Sent' : 'Received'}
              </span>
              <span className=" font-mono text-xs">
                {transfer.from === sourceWallet ? (
                  <>
                    To:{' '}
                    <Link
                      href={route('address', { id: transfer.to })}
                      className="hover: transition-colors"
                    >
                      {transfer.to.slice(0, 4)}...{transfer.to.slice(-4)}
                    </Link>
                  </>
                ) : (
                  <>
                    From:{' '}
                    <Link
                      href={route('address', { id: transfer.from })}
                      className="hover: transition-colors"
                    >
                      {transfer.from.slice(0, 4)}...{transfer.from.slice(-4)}
                    </Link>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xl  font-mono">
                {transfer.from === sourceWallet ? '↓' : '↑'}
              </div>
              <div className="flex flex-col items-end">
                <span className=" font-mono text-sm">
                  {formatSOL(transfer.amount)} SOL
                </span>
                <span className=" font-mono text-xs">
                  {formatUSD(transfer.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
