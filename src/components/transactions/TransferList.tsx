import { formatLamportsToSol, formatAddress, formatTokenAmount } from '@/utils/transaction'
import Image from 'next/image'
import styles from './TransferList.module.css'
import type { MouseEvent, SyntheticEvent } from 'react'
import { useState, useEffect } from 'react'

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

interface TokenTransfer {
  tokenMint: string
  from: string
  to: string
  amount: number
  metadata?: {
    name: string
    symbol: string
    decimals?: number
    imageUrl?: string
    tokenStandard?: string
    price_info?: {
      price_per_token: number
      currency: string
      volume_24h?: number
    }
    supply?: number
  }
}

interface TokenTransferItemProps {
  transfer: TokenTransfer
  sourceWallet: string
  targetAddress: string
}

const TokenTransferItem = ({ transfer, sourceWallet, targetAddress }: TokenTransferItemProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Use pre-fetched metadata from the API
  const tokenData = transfer.metadata || null;

  // Reset image states when metadata changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [tokenData?.imageUrl]);

  return (
    <div className="text-xs font-mono flex items-center gap-2 p-1 rounded hover:bg-green-500/5 transition-colors duration-200">
      <span className={transfer.fromUserAccount === sourceWallet ? 'text-red-400' : 'text-green-400'}>
        {transfer.fromUserAccount === sourceWallet ? '↑' : '↓'}
      </span>
      {tokenData?.imageUrl && (
        <div 
          className={`relative group cursor-pointer ${
            tokenData.tokenStandard === 'NonFungible' ? 'w-14 h-14' : 'w-6 h-6'
          }`}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            // TODO: Implement image modal
          }}
        >
          <div className="absolute inset-0 bg-green-500/5 filter blur-sm group-hover:bg-green-500/10 transition-all duration-300 rounded-lg" />
          <div className={`relative overflow-hidden ${
            tokenData?.tokenStandard === 'NonFungible' ? 'rounded-lg shadow-lg' : 'rounded-full'
          } ${imageLoading ? 'animate-pulse bg-green-500/10' : ''}`}>
            <Image
              src={tokenData?.imageUrl || ''}
              alt={tokenData?.symbol || 'token'}
              fill
              className={`${styles['token-image']} object-cover p-1 bg-black/40 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300`}
              priority={tokenData?.tokenStandard === 'NonFungible'}
              loading={tokenData?.tokenStandard === 'NonFungible' ? 'eager' : 'lazy'}
              onLoad={() => setImageLoading(false)}
              onError={(e: SyntheticEvent<HTMLImageElement>) => {
                setImageError(true);
                setImageLoading(false);
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && tokenData.symbol) {
                  parent.classList.add('bg-black/40', 'ring-1', 'ring-green-500/20', 'flex', 'items-center', 'justify-center', styles['token-fallback']);
                  const span = document.createElement('span');
                  span.className = 'text-green-500 font-mono text-xs font-medium tracking-wider';
                  span.textContent = tokenData.symbol.slice(0, 3).toUpperCase();
                  parent.appendChild(span);
                }
              }}
            />
            {tokenData.tokenStandard === 'NonFungible' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-medium tracking-wide px-2 py-1 rounded bg-black/60">
                  View NFT
                </span>
              </div>
            )}
            {tokenData.tokenStandard === 'NonFungible' && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="text-green-400 text-xs font-mono bg-black/60 px-1.5 py-0.5 rounded">
                  [view]
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <span className={styles['amount-container']}>
        {(() => {
          const formattedAmount = formatTokenAmount(
            transfer.tokenAmount,
            tokenData?.decimals || 9,
            sourceWallet,
            transfer.fromUserAccount
          )
          return (
            <>
              <span className={formattedAmount.isNegative ? styles['amount-negative'] : styles['amount-positive']}>
                {formattedAmount.formatted}{' '}
                {tokenData?.symbol || (transfer.tokenMint ? formatAddress(transfer.tokenMint) : 'Unknown')}
              </span>
              {tokenData?.price_info && (
                <span className="text-gray-500 ml-1">
                  (= ${(Math.abs(formattedAmount.value) * tokenData.price_info.price_per_token).toFixed(2)} {tokenData.price_info.currency})
                  {tokenData.supply && (
                    <span className="text-gray-400 ml-1">
                      • Supply: {(tokenData.supply / Math.pow(10, tokenData.decimals || 9)).toLocaleString()}
                    </span>
                  )}
                  {tokenData.price_info.volume_24h && (
                    <span className="text-gray-400 ml-1">
                      • 24h Vol: ${tokenData.price_info.volume_24h.toLocaleString()}
                    </span>
                  )}
                </span>
              )}
            </>
          )
        })()}
      </span>
      <span className="text-green-700">
        {transfer.fromUserAccount === sourceWallet ? 'to' : 'from'}
      </span>
      <a
        href={`https://solscan.io/account/${targetAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-600 hover:text-green-400 transition-colors"
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        {formatAddress(targetAddress)}
      </a>
    </div>
  );
};

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
            <TokenTransferItem 
              key={`${transfer.fromUserAccount}-${transfer.toUserAccount}-${transfer.tokenAmount}-${transfer.mint || ''}`}
              transfer={transfer}
              sourceWallet={sourceWallet}
              targetAddress={targetAddress}
            />
          )
        })}
    </div>
  )
}
