import { getSolscanAddressUrl } from '@/utils/constants'
import { formatAddress, formatLamportsToSol } from '@/utils/transaction'
import { ExternalLinkIcon } from 'lucide-react'

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
  if (!nativeTransfers && !tokenTransfers) {
    return null
  }

  return (
    <div className="space-y-2">
      {nativeTransfers
        ?.filter((transfer) => transfer.amount > 0)
        .map((transfer, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <a
              href={getSolscanAddressUrl(
                transfer.fromUserAccount === sourceWallet
                  ? transfer.toUserAccount
                  : transfer.fromUserAccount
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1  hover:"
            >
              <span className="font-mono">
                {formatAddress(
                  transfer.fromUserAccount === sourceWallet
                    ? transfer.toUserAccount
                    : transfer.fromUserAccount
                ).slice(0, 4)}
                ...
                {formatAddress(
                  transfer.fromUserAccount === sourceWallet
                    ? transfer.toUserAccount
                    : transfer.fromUserAccount
                ).slice(-4)}
              </span>
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
            <span>{formatLamportsToSol(transfer.amount)} SOL</span>
          </div>
        ))}
      {tokenTransfers
        ?.filter((transfer) => transfer.tokenAmount && transfer.tokenAmount > 0)
        .map((transfer, i) => {
          const targetAddress =
            transfer.fromUserAccount === sourceWallet
              ? transfer.toUserAccount
              : transfer.fromUserAccount

          return (
            <div key={i} className="flex items-center justify-between text-sm">
              <a
                href={getSolscanAddressUrl(targetAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1  hover:"
              >
                <span className="font-mono">
                  {formatAddress(targetAddress).slice(0, 4)}...
                  {formatAddress(targetAddress).slice(-4)}
                </span>
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
              <span>
                {transfer.tokenAmount?.toLocaleString() || 0}{' '}
                {transfer.mint ? formatAddress(transfer.mint) : 'Unknown'}
              </span>
            </div>
          )
        })}
    </div>
  )
}
