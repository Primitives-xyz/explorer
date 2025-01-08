import { formatLamportsToSol, formatAddress, formatTokenAmount } from '@/utils/transaction'
import { fetchTokenMetadata } from '@/utils/api'
import type { TokenMetadata } from '@/utils/api'
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

interface TokenTransferItemProps {
  transfer: TokenTransfer
  sourceWallet: string
  targetAddress: string
}

const TokenTransferItem = ({ transfer, sourceWallet, targetAddress }: TokenTransferItemProps) => {
  const [tokenData, setTokenData] = useState<TokenMetadata | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchMetadata = async () => {
      if (!transfer.mint) return;
      
      try {
        const result = await fetchTokenMetadata(transfer.mint);
        if (mounted && !controller.signal.aborted && result) {
          setTokenData(result);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching token metadata:', message);
      }
    };

    void fetchMetadata();
    
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [transfer.mint]);

  return (
    <div className="text-xs text-green-500 font-mono flex items-center gap-2">
      <span>{transfer.fromUserAccount === sourceWallet ? '↑' : '↓'}</span>
      {tokenData?.imageUrl && (
        <div 
          className={`relative group cursor-pointer ${
            tokenData.tokenStandard === 'NonFungible' ? 'w-12 h-12' : 'w-5 h-5'
          }`}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            // TODO: Implement image modal
          }}
        >
          <div className="absolute inset-0 bg-green-500/10 filter blur-sm group-hover:bg-green-500/20 transition-all duration-300 rounded-lg" />
          <div className={`relative overflow-hidden ${
            tokenData.tokenStandard === 'NonFungible' ? 'rounded-lg' : 'rounded-full'
          }`}>
            <Image
              src={tokenData.imageUrl}
              alt={tokenData.symbol || 'token'}
              fill
              className={`object-cover p-1 bg-black/40 ring-1 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300 ${
                tokenData.tokenStandard === 'NonFungible' ? styles['nft-image'] : ''
              }`}
              priority={tokenData.tokenStandard === 'NonFungible'}
              onError={(e: SyntheticEvent<HTMLImageElement>) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && tokenData.symbol) {
                  parent.classList.add('bg-black/40', 'ring-1', 'ring-green-500/20');
                  const span = document.createElement('span');
                  span.className = 'text-green-500 font-mono text-sm font-bold';
                  span.textContent = tokenData.symbol.slice(0, 3);
                  parent.appendChild(span);
                }
              }}
            />
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
                {tokenData?.symbol || (transfer.mint ? formatAddress(transfer.mint) : 'Unknown')}
              </span>
              {tokenData?.priceInfo && (
                <span className="text-gray-500 ml-1">
                  (= ${(Math.abs(formattedAmount.value) * tokenData.priceInfo.pricePerToken).toFixed(2)} {tokenData.priceInfo.currency})
                  {tokenData.token_info?.supply && (
                    <span className="text-gray-400 ml-1">
                      • Supply: {(tokenData.token_info.supply / Math.pow(10, tokenData.decimals || 9)).toLocaleString()}
                    </span>
                  )}
                  {tokenData.token_info?.price_info?.volume_24h && (
                    <span className="text-gray-400 ml-1">
                      • 24h Vol: ${tokenData.token_info.price_info.volume_24h.toLocaleString()}
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
