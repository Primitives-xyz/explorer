import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/avatar'
import { Modal } from '@/components/common/modal'
import { useTokenInfo } from '@/hooks/use-token-info-cache' // Import our custom hook
import { IGetProfileResponse } from '@/types/profile.types'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { formatNumber } from '@/utils/format'
import { formatTimeAgo } from '@/utils/format-time'
import type { Transaction } from '@/utils/helius/types'
import { route } from '@/utils/routes'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { JupiterSwapForm } from './jupiter-swap-form'
import { TransactionBadge } from './transaction-badge'
import { TransactionCommentView } from './transaction-comment-view'
import { normalizeTimestamp } from '@/utils/time'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

// Constants
const SOL_MINT = 'So11111111111111111111111111111111111111112'

// Helper function to format source name
const formatSourceName = (source: string) => {
  switch (source) {
    case 'JUPITER':
      return 'Jupiter'
    case 'RAYDIUM':
      return 'Raydium'
    case 'ORCA':
      return 'Orca'
    default:
      return source.charAt(0).toUpperCase() + source.slice(1).toLowerCase()
  }
}

// Helper to determine if a string looks like a mint address
const isMintAddress = (str: string): boolean => {
  return /^[A-Za-z0-9]{32,44}$/.test(str);
};

interface SwapToken {
  mint: string
  amount: number
  symbol?: string
}

interface SwapDetails {
  from: SwapToken | null
  to: SwapToken | null
}


export function SwapTransactionView({
  tx,
  sourceWallet,
}: {
  tx: Transaction
  sourceWallet: string
}) {
  const [showSwapModal, setShowSwapModal] = useState(false)
  const { isLoggedIn, walletAddress: currentWalletAddress } = useCurrentWallet()

  // Add profile lookup for source wallet
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: IGetProfileResponse) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  // Extract swap details from transaction - memoized
  const swapDetails = useMemo(() => {
    if (!tx) return { from: null, to: null };
    
    let fromMint = '';
    let fromAmount = 0;
    let toMint = '';
    let toAmount = 0;
    
    // Look for direct token transfers involving the sourceWallet
    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      // Find transfers where the sourceWallet is directly involved
      const fromTransfer = tx.tokenTransfers.find(
        t => t.from === sourceWallet || t.fromUserAccount === sourceWallet
      );

      const toTransfer = tx.tokenTransfers.find(
        t => t.to === sourceWallet || t.toUserAccount === sourceWallet
      );

      if (fromTransfer && (fromTransfer.mint || fromTransfer.tokenMint)) {
        fromMint = fromTransfer.mint || fromTransfer.tokenMint;
        fromAmount = fromTransfer.amount || fromTransfer.tokenAmount;
        
        // Set tokenMint if .mint or .tokenMint exists
        fromTransfer.tokenMint = fromTransfer.mint || fromTransfer.tokenMint;
      }

      if (toTransfer && (toTransfer.mint || toTransfer.tokenMint)) {
        toMint = toTransfer.mint || toTransfer.tokenMint;
        toAmount = toTransfer.amount || toTransfer.tokenAmount;
        
        // Set tokenMint if .mint or .tokenMint exists
        toTransfer.tokenMint = toTransfer.mint || toTransfer.tokenMint;
      }
    }
    // If we couldn't find from the transfers, try to parse from description
    if ((!fromMint || !toMint) && tx.description) {
      const descRegex = /swapped\s+([\d.]+)\s+([A-Za-z0-9]+)\s+for\s+([\d.]+)\s+([A-Za-z0-9]+)/i;
      const match = tx.description.match(descRegex);
      
      if (match) {
        // If we have a match from the description, parse it
        if (!fromMint || !fromAmount) {
          fromAmount = parseFloat(match[1]);
          
          // Check if the second part is a mint address
          if (match[2].length > 30) {
            fromMint = match[2];
          }
        }
        
        if (!toMint || !toAmount) {
          toAmount = parseFloat(match[3]);
          
          // Check if the fourth part is a mint address
          if (match[4].length > 30) {
            toMint = match[4];
          }
        }
      }
    }
    
    // Final fallback: check all token transfers for the right pattern
    if (!fromMint || !toMint) {
      if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
        // Look for the last transfer to the sourceWallet - likely to be the received token
        const lastToSource = [...tx.tokenTransfers]
          .reverse()
          .find(t => t.to === sourceWallet || t.toUserAccount === sourceWallet);
        
        // Look for the first transfer from the sourceWallet - likely to be the sent token
        const firstFromSource = tx.tokenTransfers
          .find(t => t.from === sourceWallet || t.fromUserAccount === sourceWallet);
        
        if (firstFromSource && !fromMint) {
          fromMint = firstFromSource.tokenMint;
          fromAmount = firstFromSource.amount || firstFromSource.tokenAmount;
        }
        
        if (lastToSource && !toMint) {
          toMint = lastToSource.tokenMint;
          toAmount = lastToSource.amount || lastToSource.tokenAmount;
        }
      }
    }
    
    return {
      from: fromMint ? {
        mint: fromMint,
        amount: fromAmount,
        symbol: fromMint === SOL_MINT ? 'SOL' : undefined
      } : null,
      to: toMint ? {
        mint: toMint,
        amount: toAmount,
        symbol: toMint === SOL_MINT ? 'SOL' : undefined
      } : null
    };
  }, [tx, sourceWallet]);

  // Check if this is a comment transaction (80/20 split)
  const isCommentTransaction = useMemo(() => 
    tx.tokenTransfers?.length === 2 &&
    tx.tokenTransfers[0].tokenAmount === 80 &&
    tx.tokenTransfers[1].tokenAmount === 20,
    [tx.tokenTransfers]
  );

  // For comments, we want to show the destination as the second transfer recipient
  const destinationWallet = useMemo(() => 
    isCommentTransaction
      ? tx.tokenTransfers?.[1].toUserAccount
      : tx.nativeTransfers?.[0]?.toUserAccount,
    [isCommentTransaction, tx.tokenTransfers, tx.nativeTransfers]
  );

  const { profiles: destProfiles } = useGetProfiles(destinationWallet || '')
  const destProfile = destProfiles?.find(
    (p: IGetProfileResponse) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  // Use our optimized token info hooks
  const { data: fromTokenInfo, loading: fromTokenLoading } = useTokenInfo(
    swapDetails.from?.mint || null
  );
  
  const { data: toTokenInfo, loading: toTokenLoading } = useTokenInfo(
    swapDetails.to?.mint || null
  );

  // Early return if we don't have complete swap details
  if (!swapDetails.from || !swapDetails.to) return null;

  const isOwnTrade = currentWalletAddress === sourceWallet;

  // Helper to get display symbol for a token
  const getDisplaySymbol = (token: SwapToken, tokenInfo?: any): string => {
    // Special case for SOL
    if (token.mint === SOL_MINT) return 'SOL';
    
    // Try to get symbol from loaded token info (asset API)
    if (tokenInfo) {
      const symbolFromInfo = tokenInfo.token_info?.symbol ||
                            tokenInfo.content?.metadata?.symbol;
      if (symbolFromInfo) return symbolFromInfo;
    }
    
    // If we have a symbol from parsing, use it
    if (token.symbol) return token.symbol;
    
    // Last resort - if it looks like a mint address, truncate it
    if (isMintAddress(token.mint)) {
      return `${token.mint.slice(0, 4)}...${token.mint.slice(-4)}`;
    }
    
    // If all else fails, return "Unknown Token"
    return "Unknown Token";
  };

  // For comment transactions, use the TransactionCommentView
  if (isCommentTransaction) {
    return (
      <div className="flex flex-col gap-3">
        <TransactionCommentView
          tx={tx}
          sourceWallet={sourceWallet}
          destinationWallet={destinationWallet}
          amount={swapDetails.from.amount}
          tokenSymbol={getDisplaySymbol(swapDetails.from, fromTokenInfo)}
        />
      </div>
    );
  }

  // Get token prices from asset API if available
  const fromPriceFromAsset = fromTokenInfo?.token_info?.price_info?.price_per_token;
  const toPriceFromAsset = toTokenInfo?.token_info?.price_info?.price_per_token;

  // For regular swaps, use the existing UI
  return (
    <div className="flex flex-col gap-3">
      {/* Transaction Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Avatar
              username={sourceProfile?.username || sourceWallet}
              size={32}
              imageUrl={sourceProfile?.image}
            />
            <span className="text-gray-300">
              {sourceProfile?.username ? (
                sourceProfile.username === sourceWallet ? (
                  <span className="font-mono">
                    {sourceWallet.slice(0, 4)}...{sourceWallet.slice(-4)}
                  </span>
                ) : (
                  `@${sourceProfile.username}`
                )
              ) : (
                <span className="font-mono">
                  {sourceWallet.slice(0, 4)}...{sourceWallet.slice(-4)}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>swapped on {formatSourceName(tx.source)}</span>
            <Link
              href={route('address', { id: tx.signature })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              • {formatTimeAgo(new Date(normalizeTimestamp(tx.timestamp)))}
            </Link>
            <span className="text-gray-500">•</span>
            <TransactionBadge type={tx.type} source={tx.source} />
          </div>
        </div>
        {!isOwnTrade && (
          <button
            onClick={() => setShowSwapModal(true)}
            className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors text-sm border border-green-500/20"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Copy Trade
          </button>
        )}
      </div>

      {/* Transaction Details */}
      <div className="flex flex-col gap-3 p-3 bg-green-900/10 rounded-lg border border-green-500/10">
        {/* From Token */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
            <div className="w-10 h-10 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
              {swapDetails.from.mint === SOL_MINT ? (
                <Image
                  src="/images/solana-icon.svg"
                  alt="solana icon"
                  width={24}
                  height={24}
                  className="group-hover:scale-110 transition-transform"
                />
              ) : fromTokenLoading ? (
                <div className="animate-pulse w-6 h-6 bg-green-500/20 rounded-lg" />
              ) : fromTokenInfo?.content?.links?.image ? (
                <img
                  src={fromTokenInfo.content.links.image}
                  alt={getDisplaySymbol(swapDetails.from, fromTokenInfo)}
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    // Fallback if image load fails
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `
                      <span class="font-mono text-xs">${swapDetails.from ? getDisplaySymbol(swapDetails.from, fromTokenInfo).slice(0, 2) : ''}</span>
                    `;
                  }}
                />
              ) : (
                <span className="font-mono text-xs">
                  {getDisplaySymbol(swapDetails.from, fromTokenInfo).slice(0, 2)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-red-400 text-sm">-</span>
              <span className="font-mono text-lg">
                {formatNumber(swapDetails.from.amount)}
              </span>
              <Link
                href={route('address', { id: swapDetails.from.mint })}
                className="font-mono text-base text-gray-400 hover:text-gray-300 transition-colors"
              >
                {getDisplaySymbol(swapDetails.from, fromTokenInfo)}
              </Link>
            </div>
            <span className="text-xs text-gray-500">
              {fromPriceFromAsset 
                ? `$${formatNumber(swapDetails.from.amount * fromPriceFromAsset)}`
                : ''}
            </span>
          </div>
        </div>

        {/* To Token */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
            <div className="w-10 h-10 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
              {swapDetails.to.mint === SOL_MINT ? (
                <Image
                  src="/images/solana-icon.svg"
                  alt="solana icon"
                  width={24}
                  height={24}
                  className="group-hover:scale-110 transition-transform"
                />
              ) : toTokenLoading ? (
                <div className="animate-pulse w-6 h-6 bg-green-500/20 rounded-lg" />
              ) : toTokenInfo?.content?.links?.image ? (
                <img
                  src={toTokenInfo.content.links.image}
                  alt={getDisplaySymbol(swapDetails.to, toTokenInfo)}
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    // Fallback if image load fails
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `
                      <span class="font-mono text-xs">${swapDetails.to ? getDisplaySymbol(swapDetails.to, toTokenInfo).slice(0, 2) : ''}</span>
                    `;
                  }}
                />
              ) : (
                <span className="font-mono text-xs">
                  {getDisplaySymbol(swapDetails.to, toTokenInfo).slice(0, 2)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-green-400 text-sm">+</span>
              <span className="font-mono text-lg">
                {formatNumber(swapDetails.to.amount)}
              </span>
              <Link
                href={route('address', { id: swapDetails.to.mint })}
                className="font-mono text-base text-gray-400 hover:text-gray-300 transition-colors"
              >
                {getDisplaySymbol(swapDetails.to, toTokenInfo)}
              </Link>
            </div>
            <span className="text-xs text-gray-500">
              {toPriceFromAsset 
                ? `$${formatNumber(swapDetails.to.amount * toPriceFromAsset)}`
                : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        title="Copy Trade"
      >
        {isLoggedIn ? (
          <JupiterSwapForm
            initialInputMint={swapDetails.from.mint}
            initialOutputMint={swapDetails.to.mint}
            initialAmount={swapDetails.from.amount.toString()}
            inputTokenName={getDisplaySymbol(swapDetails.from, fromTokenInfo)}
            outputTokenName={getDisplaySymbol(swapDetails.to, toTokenInfo)}
            inputDecimals={
              swapDetails.from.mint === SOL_MINT
                ? 9
                : fromTokenInfo?.token_info?.decimals ?? 9
            }
            sourceWallet={sourceWallet}
          />
        ) : (
          <div className="p-4 text-center">
            <DynamicConnectButton
              buttonContainerClassName="min-w-full"
              buttonClassName="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer min-w-full"
            >
              Connect Wallet to Copy Trade
            </DynamicConnectButton>
          </div>
        )}
      </Modal>
    </div>
  )
}