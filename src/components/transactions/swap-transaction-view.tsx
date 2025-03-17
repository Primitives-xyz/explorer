import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/avatar'
import { Modal } from '@/components/common/modal'
import { useTokenInfo } from '@/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/hooks/use-token-usdc-price'
import type { TokenInfo } from '@/types/Token'
import type { Profile } from '@/utils/api'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { formatNumber } from '@/utils/format'
import { formatTimeAgo } from '@/utils/format-time'
import type { Transaction, TransactionEvent } from '@/utils/helius/types'
import { route } from '@/utils/routes'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { JupiterSwapForm } from './jupiter-swap-form'
import { TransactionBadge } from './transaction-badge'
import { TransactionCommentView } from './transaction-comment-view'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

// Constants
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

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

interface TokenDisplay {
  mint: string        // Mint address (for API calls)
  symbol: string      // Display symbol (ticker)
  rawSymbol?: string  // Symbol directly from transaction description
  amount: number
  tokenInfo?: TokenInfo
  loading?: boolean
  error?: string
}

interface SwapDetails {
  from: TokenDisplay | null
  to: TokenDisplay | null
}

export function SwapTransactionView({
  tx,
  sourceWallet,
  fromMint,
  toMint,
}: {
  tx: Transaction
  sourceWallet: string
  fromMint?: string
  toMint?: string
}) {
  const [swapDetails, setSwapDetails] = useState<SwapDetails>({
    from: null,
    to: null
  })
  const [showSwapModal, setShowSwapModal] = useState(false)
  const { isLoggedIn, walletAddress: currentWalletAddress } = useCurrentWallet()

  // Add profile lookup for source wallet
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: Profile) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  // Check if this is a comment transaction (80/20 split)
  const isCommentTransaction =
    tx.tokenTransfers?.length === 2 &&
    tx.tokenTransfers[0].tokenAmount === 80 &&
    tx.tokenTransfers[1].tokenAmount === 20

  // For comments, we want to show the destination as the second transfer recipient
  const destinationWallet = isCommentTransaction
    ? tx.tokenTransfers[1].toUserAccount
    : tx.nativeTransfers?.[0]?.toUserAccount

  const { profiles: destProfiles } = useGetProfiles(destinationWallet || '')
  const destProfile = destProfiles?.find(
    (p: Profile) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  // Helper to determine if a string looks like a mint address
  const isMintAddress = (str: string): boolean => {
    return /^[A-Za-z0-9]{32,44}$/.test(str);
  };

  // Add useTokenInfo hooks for both tokens - only skip API call for SOL (which has a special icon)
  const { data: fromTokenInfo, loading: fromTokenLoading } = useTokenInfo(
    swapDetails.from?.mint === SOL_MINT ? null : swapDetails.from?.mint || null
  )
  const { data: toTokenInfo, loading: toTokenLoading } = useTokenInfo(
    swapDetails.to?.mint === SOL_MINT ? null : swapDetails.to?.mint || null
  )

  // Only fetch prices for SOL and USDC tokens
  const shouldFetchFromPrice =
    swapDetails.from?.mint &&
    (swapDetails.from.mint === SOL_MINT || swapDetails.from.mint === USDC_MINT)

  const shouldFetchToPrice =
    swapDetails.to?.mint && 
    (swapDetails.to.mint === SOL_MINT || swapDetails.to.mint === USDC_MINT)

  // Always call hooks, but pass null when we don't want to fetch
  const { price: fromTokenPriceRaw, loading: fromPriceLoadingRaw } =
    useTokenUSDCPrice(
      shouldFetchFromPrice ? swapDetails.from?.mint : null,
      shouldFetchFromPrice
        ? swapDetails.from?.mint === SOL_MINT
          ? 9 // SOL has 9 decimals
          : swapDetails.from?.tokenInfo?.result?.interface === 'FungibleToken' ||
            swapDetails.from?.tokenInfo?.result?.interface === 'FungibleAsset'
          ? swapDetails.from.tokenInfo.result.token_info?.decimals ?? 6
          : 6
        : 0
    )

  const { price: toTokenPriceRaw, loading: toPriceLoadingRaw } =
    useTokenUSDCPrice(
      shouldFetchToPrice ? swapDetails.to?.mint : null,
      shouldFetchToPrice
        ? swapDetails.to?.mint === SOL_MINT
          ? 9 // SOL has 9 decimals
          : swapDetails.to?.tokenInfo?.result?.interface === 'FungibleToken' ||
            swapDetails.to?.tokenInfo?.result?.interface === 'FungibleAsset'
          ? swapDetails.to.tokenInfo.result.token_info?.decimals ?? 6
          : 6
        : 0
    )

  // Use the results conditionally
  const fromTokenPrice = shouldFetchFromPrice ? fromTokenPriceRaw : null
  const fromPriceLoading = shouldFetchFromPrice ? fromPriceLoadingRaw : false
  const toTokenPrice = shouldFetchToPrice ? toTokenPriceRaw : null
  const toPriceLoading = shouldFetchToPrice ? toPriceLoadingRaw : false

  // Parse transaction to extract swap details
  useEffect(() => {
    async function parseSwapTransaction() {
      let fromSymbol = '';
      let toSymbol = '';
      let fromAmount = 0;
      let toAmount = 0;
      let fromMintAddress = '';
      let toMintAddress = '';

      // APPROACH 1: Try to get data from events (modern format)
      if (tx.events) {
        const swapEvent = Array.isArray(tx.events)
          ? tx.events.find(
              (event): event is Extract<TransactionEvent, { type: 'SWAP' }> =>
                event.type === 'SWAP'
            )
          : undefined;
        
        if (swapEvent) {
          // For token -> token swaps
          if (swapEvent.swap.tokenInputs?.[0] && swapEvent.swap.tokenOutputs?.[0]) {
            fromMintAddress = swapEvent.swap.tokenInputs[0].mint;
            fromAmount = swapEvent.swap.tokenInputs[0].tokenAmount;
            toMintAddress = swapEvent.swap.tokenOutputs[0].mint;
            toAmount = swapEvent.swap.tokenOutputs[0].tokenAmount;
          }
          // For SOL -> token swaps
          else if (swapEvent.swap.nativeInput && swapEvent.swap.tokenOutputs?.[0]) {
            fromMintAddress = SOL_MINT;
            fromSymbol = 'SOL';
            fromAmount = parseFloat(swapEvent.swap.nativeInput.amount);
            toMintAddress = swapEvent.swap.tokenOutputs[0].mint;
            toAmount = swapEvent.swap.tokenOutputs[0].tokenAmount;
          }
          // For token -> SOL swaps
          else if (swapEvent.swap.tokenInputs?.[0] && swapEvent.swap.nativeOutput) {
            fromMintAddress = swapEvent.swap.tokenInputs[0].mint;
            fromAmount = swapEvent.swap.tokenInputs[0].tokenAmount;
            toMintAddress = SOL_MINT;
            toSymbol = 'SOL';
            toAmount = parseFloat(swapEvent.swap.nativeOutput.amount);
          }
        }
      }

      // APPROACH 2: Look for mint addresses in token transfers
      if ((!fromMintAddress || !toMintAddress) && tx.tokenTransfers && tx.tokenTransfers.length > 0) {
        // Look for input token (usually the first outgoing transfer from the source wallet)
        const inputTransfer = tx.tokenTransfers.find(transfer => 
          transfer.fromUserAccount === sourceWallet && transfer.tokenAmount > 0
        );
        
        // Look for output token (usually incoming transfer to the source wallet)
        const outputTransfer = tx.tokenTransfers.find(transfer => 
          transfer.toUserAccount === sourceWallet && transfer.tokenAmount > 0
        );
        
        if (inputTransfer && !fromMintAddress) {
          fromMintAddress = inputTransfer.tokenMint;
          fromAmount = inputTransfer.tokenAmount;
        }
        
        if (outputTransfer && !toMintAddress) {
          toMintAddress = outputTransfer.tokenMint;
          toAmount = outputTransfer.tokenAmount;
        }
      }

      // APPROACH 3: Check native transfers for SOL transfers
      if ((!fromMintAddress || !toMintAddress) && tx.nativeTransfers && tx.nativeTransfers.length > 0) {
        // Look for SOL outgoing from source wallet
        const solOutgoing = tx.nativeTransfers.find(transfer => 
          transfer.fromUserAccount === sourceWallet && parseFloat(transfer.amount.toString()) > 0
        );
        
        // Look for SOL incoming to source wallet
        const solIncoming = tx.nativeTransfers.find(transfer => 
          transfer.toUserAccount === sourceWallet && parseFloat(transfer.amount.toString()) > 0
        );
        
        if (solOutgoing && !fromMintAddress) {
          fromMintAddress = SOL_MINT;
          fromSymbol = 'SOL';
          fromAmount = parseFloat(solOutgoing.amount.toString());
        }
        
        if (solIncoming && !toMintAddress) {
          toMintAddress = SOL_MINT;
          toSymbol = 'SOL';
          toAmount = parseFloat(solIncoming.amount.toString());
        }
      }

      // APPROACH 4: Fallback to description parsing for older format
      if (!fromMintAddress || !toMintAddress) {
        // Extract symbol and amount from description
        const descRegex = /Swapped\s+([\d.]+)\s+([A-Za-z0-9]+)\s+for\s+([\d.]+)\s+([A-Za-z0-9]+)/i;
        const match = tx.description?.match(descRegex);
        
        if (match) {
          // Get basic data from description
          const rawFromAmount = parseFloat(match[1]);
          const rawFromSymbol = match[2];
          const rawToAmount = parseFloat(match[3]);
          const rawToSymbol = match[4];
          
          // For the "from" token
          if (!fromMintAddress) {
            if (rawFromSymbol.toLowerCase() === 'sol') {
              // SOL is a special case
              fromMintAddress = SOL_MINT;
              fromSymbol = 'SOL';
              fromAmount = rawFromAmount;
            } else if (isMintAddress(rawFromSymbol)) {
              // If the symbol actually looks like a mint address
              fromMintAddress = rawFromSymbol;
              fromAmount = rawFromAmount;
            } else {
              // We couldn't determine a mint address, but we have a symbol and amount
              // This will result in no API call (mint is required), but we can still display something
              fromSymbol = rawFromSymbol;
              fromAmount = rawFromAmount;
            }
          }
          
          // For the "to" token
          if (!toMintAddress) {
            if (rawToSymbol.toLowerCase() === 'sol') {
              // SOL is a special case
              toMintAddress = SOL_MINT;
              toSymbol = 'SOL';
              toAmount = rawToAmount;
            } else if (isMintAddress(rawToSymbol)) {
              // If the symbol actually looks like a mint address
              toMintAddress = rawToSymbol;
              toAmount = rawToAmount;
            } else {
              // We couldn't determine a mint address, but we have a symbol and amount
              toSymbol = rawToSymbol;
              toAmount = rawToAmount;
            }
          }
        }
      }

      // Use provided mints if available (override)
      if (fromMint) {
        fromMintAddress = fromMint;
      }
      if (toMint) {
        toMintAddress = toMint;
      }

      // Set swap details
      setSwapDetails({
        from: {
          mint: fromMintAddress || '', // Fallback to empty string if we couldn't determine a mint
          symbol: fromSymbol || (fromMintAddress === SOL_MINT ? 'SOL' : ''),
          rawSymbol: fromSymbol || undefined,
          amount: fromAmount
        },
        to: {
          mint: toMintAddress || '', // Fallback to empty string if we couldn't determine a mint
          symbol: toSymbol || (toMintAddress === SOL_MINT ? 'SOL' : ''),
          rawSymbol: toSymbol || undefined,
          amount: toAmount
        }
      });
    }

    parseSwapTransaction();
  }, [tx, fromMint, toMint, sourceWallet]);

  // Update token info when data is loaded
  useEffect(() => {
    if (swapDetails.from && fromTokenInfo) {
      setSwapDetails(prev => ({
        ...prev,
        from: prev.from ? { ...prev.from, tokenInfo: fromTokenInfo } : null
      }));
    }
  }, [fromTokenInfo]);

  useEffect(() => {
    if (swapDetails.to && toTokenInfo) {
      setSwapDetails(prev => ({
        ...prev,
        to: prev.to ? { ...prev.to, tokenInfo: toTokenInfo } : null
      }));
    }
  }, [toTokenInfo]);

  if (!swapDetails.from || !swapDetails.to) return null;

  const isOwnTrade = currentWalletAddress === sourceWallet;
  const isUserToUser = destinationWallet && sourceWallet !== destinationWallet;

  // Helper to get display symbol for a token
  const getDisplaySymbol = (token: TokenDisplay): string => {
    // Special case for SOL
    if (token.mint === SOL_MINT) return 'SOL';
    
    // Try to get symbol from loaded token info
    const symbolFromInfo = token.tokenInfo?.result?.content?.metadata?.symbol;
    if (symbolFromInfo) return symbolFromInfo;
    
    // If we have a symbol from transaction parsing, use it
    if (token.symbol) return token.symbol;
    
    // If we have a rawSymbol from description, use it
    if (token.rawSymbol) return token.rawSymbol;
    
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
          tokenSymbol={getDisplaySymbol(swapDetails.from)}
        />
      </div>
    );
  }

  // For regular swaps, use the existing UI
  return (
    <div className="flex flex-col gap-3">
      {/* Transaction Header - Simplified */}
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
              • {formatTimeAgo(new Date(tx.timestamp))}
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
              ) : swapDetails.from.tokenInfo?.result?.content?.links?.image ? (
                <img
                  src={swapDetails.from.tokenInfo.result.content.links.image}
                  alt={getDisplaySymbol(swapDetails.from)}
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    // Fallback if image load fails
                    console.log('Image load failed:', swapDetails.from?.tokenInfo?.result);
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `
                      <span class="font-mono text-xs">${swapDetails.from ? getDisplaySymbol(swapDetails.from).slice(0, 2) : ''}</span>
                    `;
                  }}
                />
              ) : (
                <span className="font-mono text-xs">
                  {getDisplaySymbol(swapDetails.from).slice(0, 2)}
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
                {getDisplaySymbol(swapDetails.from)}
              </Link>
            </div>
            <span className="text-xs text-gray-500">
              {fromTokenPrice !== null && !fromPriceLoading
                ? `$${formatNumber(swapDetails.from.amount * fromTokenPrice)}`
                : fromPriceLoading
                ? 'Loading...'
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
              ) : swapDetails.to.tokenInfo?.result?.content?.links?.image ? (
                <img
                  src={swapDetails.to.tokenInfo.result.content.links.image}
                  alt={getDisplaySymbol(swapDetails.to)}
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    // Fallback if image load fails
                    console.log('Image load failed:', swapDetails.to?.tokenInfo?.result);
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `
                      <span class="font-mono text-xs">${swapDetails.to ? getDisplaySymbol(swapDetails.to).slice(0, 2) : ''}</span>
                    `;
                  }}
                />
              ) : (
                <span className="font-mono text-xs">
                  {getDisplaySymbol(swapDetails.to).slice(0, 2)}
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
                {getDisplaySymbol(swapDetails.to)}
              </Link>
            </div>
            <span className="text-xs text-gray-500">
              {toTokenPrice !== null && !toPriceLoading
                ? `$${formatNumber(swapDetails.to.amount * toTokenPrice)}`
                : toPriceLoading
                ? 'Loading...'
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
            inputTokenName={getDisplaySymbol(swapDetails.from)}
            outputTokenName={getDisplaySymbol(swapDetails.to)}
            inputDecimals={
              swapDetails.from.mint === SOL_MINT
                ? 9
                : swapDetails.from.tokenInfo?.result &&
                  'token_info' in swapDetails.from.tokenInfo.result
                ? swapDetails.from.tokenInfo.result.token_info?.decimals ?? 9
                : 9
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