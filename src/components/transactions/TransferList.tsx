import { formatLamportsToSol, formatAddress, getTokenSymbol } from '@/utils/transaction'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getTokenMetadata } from '@/utils/helius/token-api'
import { TokenMetadata } from '@/types/transaction'

interface Transfer {
  fromUserAccount: string
  toUserAccount: string
  amount: number
}

interface TokenTransfer {
  fromUserAccount: string
  toUserAccount: string
  tokenAmount: number
  mint?: string
  metadata?: TokenMetadata
}

interface TransferListProps {
  nativeTransfers?: Transfer[]
  tokenTransfers?: TokenTransfer[]
  sourceWallet: string
}

export const TransferList = ({
  nativeTransfers,
  tokenTransfers,
  sourceWallet,
}: TransferListProps) => {
  const [enrichedTransfers, setEnrichedTransfers] = useState(tokenTransfers)

  useEffect(() => {
    const enrichTransfers = async () => {
      if (!tokenTransfers) return

      const enrichedTransfers = await Promise.all(
        tokenTransfers.map(async (transfer) => {
          if (!transfer.mint) return transfer
          try {
            const metadata = await getTokenMetadata(transfer.mint)
            return { ...transfer, metadata }
          } catch (error) {
            console.error('Error fetching token metadata:', error)
            return transfer
          }
        }),
      )

      setEnrichedTransfers(enrichedTransfers)
    }

    enrichTransfers()
  }, [tokenTransfers])

  return (
    <div className="flex flex-col gap-1 mt-2">
      {nativeTransfers?.map((transfer, i) => (
        <div
          key={i}
          className="text-xs text-green-500 font-mono flex items-center gap-1"
        >
          <span>{transfer.fromUserAccount === sourceWallet ? '↑' : '↓'}</span>
          <div className="flex items-center gap-1">
            <Image
              src="/solana-sol-logo.svg"
              alt="SOL"
              width={14}
              height={14}
              className="rounded-full"
            />
            <span>{formatLamportsToSol(transfer.amount)} SOL</span>
          </div>
          <span className="text-green-700">
            {transfer.fromUserAccount === sourceWallet ? 'to' : 'from'}
          </span>
          <a
            href={`https://solscan.io/account/${
              transfer.fromUserAccount === sourceWallet
                ? transfer.toUserAccount
                : transfer.fromUserAccount
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-400 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {formatAddress(
              transfer.fromUserAccount === sourceWallet
                ? transfer.toUserAccount
                : transfer.fromUserAccount,
            )}
          </a>
        </div>
      ))}

      {enrichedTransfers
        ?.filter((transfer) => transfer.tokenAmount && transfer.tokenAmount > 0)
        .map((transfer, i) => {
          const targetAddress =
            transfer.fromUserAccount === sourceWallet
              ? transfer.toUserAccount
              : transfer.fromUserAccount

          return (
            <div
              key={i}
              className="text-xs text-green-500 font-mono flex items-center gap-1"
            >
              <span>
                {transfer.fromUserAccount === sourceWallet ? '↑' : '↓'}
              </span>
              <div className="flex items-center gap-1">
                {transfer.metadata?.image && (
                  <Image
                    src={transfer.metadata.image}
                    alt={transfer.metadata.symbol}
                    width={14}
                    height={14}
                    className="rounded-full"
                  />
                )}
                <span>
                  {transfer.tokenAmount?.toLocaleString() || 0}{' '}
                  {transfer.metadata?.symbol ||
                    (transfer.mint && formatAddress(transfer.mint))}
                </span>
              </div>
              <span className="text-green-700">
                {transfer.fromUserAccount === sourceWallet ? 'to' : 'from'}
              </span>
              {targetAddress && (
                <a
                  href={`https://solscan.io/account/${targetAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-400 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {formatAddress(targetAddress)}
                </a>
              )}
            </div>
          )
        })}
    </div>
  )
}
