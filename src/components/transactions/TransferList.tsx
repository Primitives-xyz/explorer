import { formatLamportsToSol, formatAddress } from '@/utils/transaction'
import { fetchTokenMetadata, TokenMetadata } from '@/utils/api'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './TransferList.module.css'

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

          const [tokenMeta, setTokenMeta] = useState<TokenMetadata | null>(null)

          useEffect(() => {
            if (transfer.mint) {
              fetchTokenMetadata(transfer.mint).then((meta) => {
                if (meta) setTokenMeta(meta)
              })
            }
          }, [transfer.mint])

          return (
            <div
              key={i}
              className="text-xs text-green-500 font-mono flex items-center gap-2"
            >
              <span>
                {transfer.fromUserAccount === sourceWallet ? '↑' : '↓'}
              </span>
              {tokenMeta?.imageUrl && (
                <div 
                  className={`relative group cursor-pointer ${
                    tokenMeta.tokenStandard === 'NonFungible' 
                      ? 'w-12 h-12' 
                      : 'w-5 h-5'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement image modal
                  }}
                >
                  <div className="absolute inset-0 bg-green-500/10 filter blur-sm group-hover:bg-green-500/20 transition-all duration-300 rounded-lg"></div>
                  <div className={`relative overflow-hidden ${
                    tokenMeta.tokenStandard === 'NonFungible' 
                      ? 'rounded-lg' 
                      : 'rounded-full'
                  }`}>
                    <Image
                      src={tokenMeta.imageUrl}
                      alt={tokenMeta.symbol || 'token'}
                      fill
                      className={`object-cover p-1 bg-black/40 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300 ${
                        tokenMeta.tokenStandard === 'NonFungible' ? styles['nft-image'] : ''
                      }`}
                      priority={tokenMeta.tokenStandard === 'NonFungible'}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.classList.add('bg-black/40', 'ring-1', 'ring-green-500/20');
                          if (tokenMeta.symbol) {
                            const span = document.createElement('span');
                            span.className = 'text-green-500 font-mono text-sm font-bold';
                            span.textContent = tokenMeta.symbol.slice(0, 3);
                            parent.appendChild(span);
                          }
                        }
                      }}
                      />
                    {tokenMeta.tokenStandard === 'NonFungible' && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="text-green-400 text-xs font-mono bg-black/60 px-1.5 py-0.5 rounded">
                          [view]
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <span>
                {transfer.tokenAmount?.toLocaleString() || 0}{' '}
                {tokenMeta?.symbol || (transfer.mint ? formatAddress(transfer.mint) : 'Unknown')}
                {tokenMeta?.priceInfo && (
                  <span className="text-gray-500 ml-1">
                    (${(transfer.tokenAmount * tokenMeta.priceInfo.pricePerToken).toFixed(2)} {tokenMeta.priceInfo.currency})
                  </span>
                )}
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
