import { formatLamportsToSol, formatAddress } from '@/utils/transaction'

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
  return (
    <div className="space-y-0.5">
      {nativeTransfers
        ?.filter((transfer) => transfer.amount > 0)
        .map((transfer, i) => (
          <div
            key={i}
            className="text-xs text-green-500 font-mono flex items-center gap-1"
          >
            <span>{transfer.fromUserAccount === sourceWallet ? '↑' : '↓'}</span>
            <span>{formatLamportsToSol(transfer.amount)} SOL</span>
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
      {tokenTransfers
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
              <span>
                {transfer.tokenAmount?.toLocaleString() || 0}{' '}
                {transfer.mint ? `${formatAddress(transfer.mint)}` : 'Unknown'}
              </span>
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
