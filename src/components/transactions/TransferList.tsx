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
    <div className="space-y-1">
      {nativeTransfers
        ?.filter((transfer) => transfer.amount > 0)
        .map((transfer, i) => (
          <div
            key={i}
            className="text-[10px] sm:text-xs text-green-500 font-mono flex flex-wrap items-center gap-1 p-1 rounded hover:bg-green-900/10"
          >
            <span className="flex-shrink-0">
              {transfer.fromUserAccount === sourceWallet ? '↑' : '↓'}
            </span>
            <span className="flex-shrink-0 font-medium">
              {formatLamportsToSol(transfer.amount)} SOL
            </span>
            <span className="text-green-700 flex-shrink-0">
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
              className="text-green-600 hover:text-green-400 transition-colors break-all"
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
              className="text-[10px] sm:text-xs text-green-500 font-mono flex flex-wrap items-center gap-1 p-1 rounded hover:bg-green-900/10"
            >
              <span className="flex-shrink-0">
                {transfer.fromUserAccount === sourceWallet ? '↑' : '↓'}
              </span>
              <span className="flex-shrink-0 font-medium">
                {transfer.tokenAmount?.toLocaleString() || 0}{' '}
                {transfer.mint ? (
                  <span className="text-green-600">
                    {formatAddress(transfer.mint)}
                  </span>
                ) : (
                  'Unknown'
                )}
              </span>
              <span className="text-green-700 flex-shrink-0">
                {transfer.fromUserAccount === sourceWallet ? 'to' : 'from'}
              </span>
              {targetAddress && (
                <a
                  href={`https://solscan.io/account/${targetAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-400 transition-colors break-all"
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
