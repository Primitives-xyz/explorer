import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/avatar'
import { Modal } from '@/components/common/modal'
import { useTokenInfo } from '@/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/hooks/use-token-usdc-price'
import type { TokenInfo } from '@/types/Token'
import type { Profile } from '@/utils/api'
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
  mint: string
  amount: number
  tokenInfo?: TokenInfo
  loading?: boolean
  error?: string
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
  const [fromToken, setFromToken] = useState<TokenDisplay | null>(null)
  const [toToken, setToToken] = useState<TokenDisplay | null>(null)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const { isLoggedIn, walletAddress: currentWalletAddress } = useCurrentWallet()

  // Add profile lookup for source wallet
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: Profile) => p.namespace.name === 'nemoapp'
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
    (p: Profile) => p.namespace.name === 'nemoapp'
  )?.profile

  // Add useTokenInfo hooks for both tokens
  const { data: fromTokenInfo, loading: fromTokenLoading } = useTokenInfo(
    fromToken?.mint === SOL_MINT ? null : fromToken?.mint
  )
  const { data: toTokenInfo, loading: toTokenLoading } = useTokenInfo(
    toToken?.mint === SOL_MINT ? null : toToken?.mint
  )

  // Only fetch prices for SOL and USDC tokens
  const shouldFetchFromPrice =
    fromToken?.mint &&
    (fromToken.mint === SOL_MINT || fromToken.mint === USDC_MINT)

  const shouldFetchToPrice =
    toToken?.mint && (toToken.mint === SOL_MINT || toToken.mint === USDC_MINT)

  // Add price hooks for both tokens, but only if they're SOL or USDC
  const { price: fromTokenPrice, loading: fromPriceLoading } =
    shouldFetchFromPrice
      ? useTokenUSDCPrice(
          fromToken?.mint,
          fromToken?.mint === SOL_MINT
            ? 9 // SOL has 9 decimals
            : fromToken?.tokenInfo?.result?.interface === 'FungibleToken' ||
              fromToken?.tokenInfo?.result?.interface === 'FungibleAsset'
            ? fromToken.tokenInfo.result.token_info?.decimals ?? 6
            : 6
        )
      : { price: null, loading: false }

  const { price: toTokenPrice, loading: toPriceLoading } = shouldFetchToPrice
    ? useTokenUSDCPrice(
        toToken?.mint,
        toToken?.mint === SOL_MINT
          ? 9 // SOL has 9 decimals
          : toToken?.tokenInfo?.result?.interface === 'FungibleToken' ||
            toToken?.tokenInfo?.result?.interface === 'FungibleAsset'
          ? toToken.tokenInfo.result.token_info?.decimals ?? 6
          : 6
      )
    : { price: null, loading: false }

  useEffect(() => {
    async function loadTokenInfo() {
      if (!tx.events) return
      // Handle swap event format
      const swapEvent = Array.isArray(tx.events)
        ? tx.events.find(
            (event): event is Extract<TransactionEvent, { type: 'SWAP' }> =>
              event.type === 'SWAP'
          )
        : undefined
      if (swapEvent) {
        // For token -> token swaps
        if (
          swapEvent.swap.tokenInputs?.[0] &&
          swapEvent.swap.tokenOutputs?.[0]
        ) {
          setFromToken({
            mint: swapEvent.swap.tokenInputs[0].mint,
            amount: swapEvent.swap.tokenInputs[0].tokenAmount,
          })

          setToToken({
            mint: swapEvent.swap.tokenOutputs[0].mint,
            amount: swapEvent.swap.tokenOutputs[0].tokenAmount,
          })
        }
        // For SOL -> token swaps
        else if (
          swapEvent.swap.nativeInput &&
          swapEvent.swap.tokenOutputs?.[0]
        ) {
          setFromToken({
            mint: SOL_MINT,
            amount: parseFloat(swapEvent.swap.nativeInput.amount),
          })

          setToToken({
            mint: swapEvent.swap.tokenOutputs[0].mint,
            amount: swapEvent.swap.tokenOutputs[0].tokenAmount,
          })
        }
        // For token -> SOL swaps
        else if (
          swapEvent.swap.tokenInputs?.[0] &&
          swapEvent.swap.nativeOutput
        ) {
          setFromToken({
            mint: swapEvent.swap.tokenInputs[0].mint,
            amount: swapEvent.swap.tokenInputs[0].tokenAmount,
          })

          setToToken({
            mint: SOL_MINT,
            amount: parseFloat(swapEvent.swap.nativeOutput.amount),
          })
        }
        return
      }

      // Fallback to description parsing for older format
      const descParts = tx.description?.split(' ') || []
      const fromAmount = parseFloat(descParts[2] || '0')
      const toAmount = parseFloat(descParts[5] || '0')
      const fromTokenMint = fromMint || descParts[3] || ''
      const toTokenMint = toMint || descParts[6] || ''

      // Check if this is a SOL -> Token swap or Token -> SOL swap
      const isFromSol = fromTokenMint.toLowerCase() === 'sol'
      const isToSol = toTokenMint.toLowerCase() === 'sol'

      // Handle SOL -> Token swap
      if (isFromSol) {
        setFromToken({
          mint: SOL_MINT,
          amount: fromAmount,
        })

        if (toTokenMint) {
          setToToken({
            mint: toTokenMint,
            amount: toAmount,
          })
        }
      }
      // Handle Token -> SOL swap
      else if (isToSol) {
        setToToken({
          mint: SOL_MINT,
          amount: toAmount,
        })

        if (fromTokenMint) {
          setFromToken({
            mint: fromTokenMint,
            amount: fromAmount,
          })
        }
      }
      // Handle Token -> Token swap (including when mints are provided directly)
      else {
        if (fromTokenMint) {
          setFromToken({
            mint: fromTokenMint,
            amount: fromAmount,
          })
        }
        if (toTokenMint) {
          setToToken({
            mint: toTokenMint,
            amount: toAmount,
          })
        }
      }
    }

    loadTokenInfo()
  }, [tx, sourceWallet, fromMint, toMint])

  // Update token info when data is loaded
  useEffect(() => {
    if (fromToken && fromTokenInfo) {
      setFromToken((prev) =>
        prev ? { ...prev, tokenInfo: fromTokenInfo } : null
      )
    }
  }, [fromTokenInfo])

  useEffect(() => {
    if (toToken && toTokenInfo) {
      setToToken((prev) => (prev ? { ...prev, tokenInfo: toTokenInfo } : null))
    }
  }, [toTokenInfo])

  if (!fromToken || !toToken) return null

  const isOwnTrade = currentWalletAddress === sourceWallet
  const isUserToUser = destinationWallet && sourceWallet !== destinationWallet

  // For comment transactions, use the TransactionCommentView
  if (isCommentTransaction) {
    return (
      <div className="flex flex-col gap-3">
        <TransactionCommentView
          tx={tx}
          sourceWallet={sourceWallet}
          destinationWallet={destinationWallet}
          amount={fromToken.amount}
          tokenSymbol={
            fromToken.mint === SOL_MINT
              ? 'SOL'
              : fromToken.tokenInfo?.result?.content?.metadata?.symbol ||
                `${fromToken.mint.slice(0, 4)}...${fromToken.mint.slice(-4)}`
          }
        />
      </div>
    )
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
              {fromToken.mint === SOL_MINT ? (
                <Image
                  src="/images/solana-icon.svg"
                  alt="solana icon"
                  width={24}
                  height={24}
                  className="group-hover:scale-110 transition-transform"
                />
              ) : fromTokenLoading ? (
                <div className="animate-pulse w-6 h-6 bg-green-500/20 rounded-lg" />
              ) : fromToken.tokenInfo?.result?.content?.links?.image ? (
                <img
                  src={fromToken.tokenInfo.result.content.links.image}
                  alt={
                    fromToken.tokenInfo.result?.content?.metadata?.symbol ||
                    'Token'
                  }
                  className="w-8 h-8 rounded-lg"
                />
              ) : (
                <span className="font-mono text-xs">
                  {fromToken.mint.slice(0, 2)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-red-400 text-sm">-</span>
              <span className="font-mono text-lg">
                {formatNumber(fromToken.amount)}
              </span>
              <Link
                href={route('address', { id: fromToken.mint })}
                className="font-mono text-base text-gray-400 hover:text-gray-300 transition-colors"
              >
                {fromToken.mint === SOL_MINT
                  ? 'SOL'
                  : fromToken.tokenInfo?.result?.content?.metadata?.symbol ||
                    `${fromToken.mint.slice(0, 4)}...${fromToken.mint.slice(
                      -4
                    )}`}
              </Link>
            </div>
            <span className="text-xs text-gray-500">
              {fromTokenPrice !== null && !fromPriceLoading
                ? `$${formatNumber(fromToken.amount * fromTokenPrice)}`
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
              {toToken.mint === SOL_MINT ? (
                <Image
                  src="/images/solana-icon.svg"
                  alt="solana icon"
                  width={24}
                  height={24}
                  className="group-hover:scale-110 transition-transform"
                />
              ) : toTokenLoading ? (
                <div className="animate-pulse w-6 h-6 bg-green-500/20 rounded-lg" />
              ) : toToken.tokenInfo?.result?.content?.links?.image ? (
                <img
                  src={toToken.tokenInfo.result.content.links.image}
                  alt={
                    toToken.tokenInfo.result?.content?.metadata?.symbol ||
                    'Token'
                  }
                  className="w-8 h-8 rounded-lg"
                />
              ) : (
                <span className="font-mono text-xs">
                  {toToken.mint.slice(0, 2)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-green-400 text-sm">+</span>
              <span className="font-mono text-lg">
                {formatNumber(toToken.amount)}
              </span>
              <Link
                href={route('address', { id: toToken.mint })}
                className="font-mono text-base text-gray-400 hover:text-gray-300 transition-colors"
              >
                {toToken.mint === SOL_MINT
                  ? 'SOL'
                  : toToken.tokenInfo?.result?.content?.metadata?.symbol ||
                    `${toToken.mint.slice(0, 4)}...${toToken.mint.slice(-4)}`}
              </Link>
            </div>
            <span className="text-xs text-gray-500">
              {toTokenPrice !== null && !toPriceLoading
                ? `$${formatNumber(toToken.amount * toTokenPrice)}`
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
            initialInputMint={fromToken.mint}
            initialOutputMint={toToken.mint}
            initialAmount={fromToken.amount.toString()}
            inputTokenName={
              fromToken.mint === SOL_MINT
                ? 'SOL'
                : fromToken.tokenInfo?.result?.content?.metadata?.symbol ||
                  `${fromToken.mint.slice(0, 4)}...${fromToken.mint.slice(-4)}`
            }
            outputTokenName={
              toToken.mint === SOL_MINT
                ? 'SOL'
                : toToken.tokenInfo?.result?.content?.metadata?.symbol ||
                  `${toToken.mint.slice(0, 4)}...${toToken.mint.slice(-4)}`
            }
            inputDecimals={
              fromToken.mint === SOL_MINT
                ? 9
                : fromToken.tokenInfo?.result &&
                  'token_info' in fromToken.tokenInfo.result
                ? fromToken.tokenInfo.result.token_info?.decimals ?? 9
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
