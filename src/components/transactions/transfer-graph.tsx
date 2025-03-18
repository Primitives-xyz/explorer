import React, { useMemo } from 'react';
import { getSolscanAddressUrl } from '@/utils/constants';
import { formatAddress, formatLamportsToSol } from '@/utils/transaction';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useTokenInfo } from '@/hooks/use-token-info-cache';
import Image from 'next/image';

interface Transfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
}

interface TokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint?: string;
  tokenMint?: string;
}

interface TransferGraphProps {
  nativeTransfers?: Transfer[];
  tokenTransfers?: TokenTransfer[];
  sourceWallet: string;
  sourceProfile?: {
    username?: string;
    image?: string;
  };
}

// Constants
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Helper to determine if a string looks like a mint address
const isMintAddress = (str: string): boolean => {
  return /^[A-Za-z0-9]{32,44}$/.test(str);
};

const TransferGraph = ({
  nativeTransfers,
  tokenTransfers,
  sourceWallet,
  sourceProfile,
}: TransferGraphProps) => {
  if (!nativeTransfers && !tokenTransfers) {
    return null;
  }

  // Prepare data for the graph
  const transfers = useMemo(() => {
    // Process SOL native transfers
    const solTransfers = (nativeTransfers || [])
      .filter((transfer) => transfer.amount > 0)
      .map((transfer) => ({
        from: transfer.fromUserAccount,
        to: transfer.toUserAccount,
        amount: formatLamportsToSol(transfer.amount),
        type: 'SOL',
        mint: SOL_MINT,
      }));

    // Process token transfers
    const tokenTransfersData = (tokenTransfers || [])
      .filter((transfer) => transfer.tokenAmount && transfer.tokenAmount > 0)
      .map((transfer) => ({
        from: transfer.fromUserAccount,
        to: transfer.toUserAccount,
        amount: transfer.tokenAmount?.toLocaleString() || '0',
        type: 'TOKEN',
        mint: transfer.mint || transfer.tokenMint || 'Unknown',
      }));

    return [...solTransfers, ...tokenTransfersData];
  }, [nativeTransfers, tokenTransfers]);

  return (
    <div className="space-y-2">
      {transfers.map((transfer, i) => (
        <TransferItem 
          key={i} 
          transfer={transfer} 
          sourceWallet={sourceWallet} 
          sourceProfile={sourceProfile}
        />
      ))}
    </div>
  );
};

// Separate TransferItem component to use hooks for each transfer
interface TransferItemProps {
  transfer: {
    from: string;
    to: string;
    amount: string;
    type: string;
    mint: string;
  };
  sourceWallet: string;
  sourceProfile?: {
    username?: string;
    image?: string;
  };
}

const TransferItem = ({ transfer, sourceWallet, sourceProfile }: TransferItemProps) => {
  // Use the token info hook    
  const { data: tokenInfo, loading: tokenLoading } = useTokenInfo(
    transfer.mint !== 'Unknown' ? transfer.mint : null
  );

  // Helper to get display symbol for a token
  const getDisplaySymbol = (mint: string, tokenInfo: any) => {
    // Special case for SOL
    if (mint === SOL_MINT) return 'SOL';
    
    // Try to get symbol from loaded token info (asset API)
    if (tokenInfo) {
      const symbolFromInfo = tokenInfo.token_info?.symbol ||
                           tokenInfo.content?.metadata?.symbol;
      if (symbolFromInfo) return symbolFromInfo;
    }
    
    // Last resort - if it looks like a mint address, truncate it
    if (isMintAddress(mint)) {
      return `${mint.slice(0, 4)}...${mint.slice(-4)}`;
    }
    
    // If all else fails, return "Unknown Token"
    return "Unknown Token";
  };

  const displaySymbol = getDisplaySymbol(transfer.mint, tokenInfo);

  // Animation keyframes for the pulsing effect
  const pulseAnimation = `
    @keyframes pulse {
      0% { opacity: 0.4; }
      50% { opacity: 1; }
      100% { opacity: 0.4; }
    }
    .pulse-arrow {
      animation: pulse 2s infinite;
    }
  `;

  return (
    <div className="grid grid-cols-5 items-center text-sm">
      {/* From account - first column */}
      <div className="col-span-1 text-right">
        <a
          href={getSolscanAddressUrl(transfer.from)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-start gap-1 hover:underline"
        >
          {transfer.from === sourceWallet && sourceProfile?.username ? (
            <span>@{sourceProfile.username}</span>
          ) : (
            <span className="font-mono">
              {formatAddress(transfer.from).slice(0, 4)}...
              {formatAddress(transfer.from).slice(-4)}
            </span>
          )}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      
      {/* Left arrow - second column */}
      <div className="col-span-1 flex justify-center">
        <style>{pulseAnimation}</style>
        <ArrowRight 
          className="w-4 h-4 text-green-500 pulse-arrow" 
        />
      </div>
      
      {/* Token info - third column */}
      <div className="col-span-1 flex justify-center">
        <div className="flex items-center gap-2">
          {/* Token Icon */}
          <div className="w-5 h-5 rounded-full overflow-hidden bg-black/40 flex items-center justify-center">
            {transfer.mint === SOL_MINT ? (
              <Image
                src="/images/solana-icon.svg"
                alt="SOL"
                width={12}
                height={12}
              />
            ) : tokenLoading ? (
              <div className="animate-pulse w-3 h-3 bg-green-500/20 rounded-full" />
            ) : tokenInfo?.content?.links?.image ? (
              <img
                src={tokenInfo.content.links.image}
                alt={displaySymbol}
                className="w-4 h-4 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `
                    <span class="font-mono text-[9px]">${displaySymbol.slice(0, 2)}</span>
                  `;
                }}
              />
            ) : (
              <span className="font-mono text-[9px]">
                {displaySymbol.slice(0, 2)}
              </span>
            )}
          </div>
          
          {/* Amount and Symbol */}
          <div className="flex flex-col">
            <span className="font-mono text-xs">
              {transfer.amount}
            </span>
            <span className="text-[10px] text-gray-500">
              {displaySymbol}
            </span>
          </div>
        </div>
      </div>
      
      {/* Right arrow - fourth column */}
      <div className="col-span-1 flex justify-center">
        <ArrowRight 
          className="w-4 h-4 text-green-500 pulse-arrow" 
          style={{ animationDelay: "0.5s" }}
        />
      </div>
      
      {/* To account - fifth column */}
      <div className="col-span-1 text-left">
        <a
          href={getSolscanAddressUrl(transfer.to)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-end gap-1 hover:underline"
        >
          {transfer.to === sourceWallet && sourceProfile?.username ? (
            <span>@{sourceProfile.username}</span>
          ) : (
            <span className="font-mono">
              {formatAddress(transfer.to).slice(0, 4)}...
              {formatAddress(transfer.to).slice(-4)}
            </span>
          )}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default TransferGraph;