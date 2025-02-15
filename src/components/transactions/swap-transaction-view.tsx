import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/avatar'
import { Modal } from '@/components/common/modal'
import { useTokenInfo } from '@/hooks/use-token-info'
import type { TokenInfo } from '@/types/Token'
import type { Profile } from '@/utils/api'
import { formatNumber } from '@/utils/format'
import { formatTimeAgo } from '@/utils/format-time'
import type { Transaction } from '@/utils/helius/types'
import { route } from '@/utils/routes'
import { ExternalLink } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { JupiterSwapForm } from './jupiter-swap-form'
import { TransactionCommentView } from './transaction-comment-view'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

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
    fromToken?.mint === 'So11111111111111111111111111111111111111112'
      ? null
      : fromToken?.mint
  )
  const { data: toTokenInfo, loading: toTokenLoading } = useTokenInfo(
    toToken?.mint === 'So11111111111111111111111111111111111111112'
      ? null
      : toToken?.mint
  )
  useEffect(() => {
    async function loadTokenInfo() {
      // Parse description for initial token info
      // Format can be either:
      // "wallet swapped X SOL for Y TOKEN" or
      // "wallet swapped X TOKEN for Y SOL"
      const descParts = tx.description?.split(' ') || []
      const fromAmount = parseFloat(descParts[2] || '0')
      const toAmount = parseFloat(descParts[5] || '0')
      const fromTokenMint = fromMint || descParts[3] || ''
      const toTokenMint = toMint || descParts[6] || ''
      console.log({ toMint, fromMint, fromTokenMint, toTokenMint, descParts })

      const SOL_MINT = 'So11111111111111111111111111111111111111112'

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
            fromToken.mint === 'So11111111111111111111111111111111111111112'
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
          <Link
            href={route('address', { id: sourceProfile?.username || sourceWallet })}
            className="hover:text-gray-300 transition-colors"
          >
            {sourceProfile?.username === sourceWallet 
              ? `${sourceWallet.slice(0, 4)}...${sourceWallet.slice(-4)}`
              : sourceProfile?.username || `${sourceWallet.slice(0, 4)}...${sourceWallet.slice(-4)}`}
          </Link>
          <Link
            href={route('address', { id: tx.signature })}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            swapped
          </Link>
          <span className="text-gray-500">on Jupiter • {formatTimeAgo(new Date(tx.timestamp))}</span>
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
              {fromToken.mint === 'So11111111111111111111111111111111111111112' ? (
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
                  alt={fromToken.tokenInfo.result?.content?.metadata?.symbol || 'Token'}
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
              <span className="font-mono text-lg">{formatNumber(fromToken.amount)}</span>
              <Link
                href={route('address', { id: fromToken.mint })}
                className="font-mono text-base text-gray-400 hover:text-gray-300 transition-colors"
              >
                {fromToken.mint === 'So11111111111111111111111111111111111111112'
                  ? 'SOL'
                  : fromToken.tokenInfo?.result?.content?.metadata?.symbol ||
                    `${fromToken.mint.slice(0, 4)}...${fromToken.mint.slice(-4)}`}
              </Link>
            </div>
            <span className="text-sm text-gray-500">
              ${formatNumber(fromToken.amount * (fromToken.tokenInfo?.result && 'token_info' in fromToken.tokenInfo.result ? fromToken.tokenInfo.result.token_info?.price_info?.price_per_token || 0 : 0))}
            </span>
          </div>
        </div>

        {/* To Token */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
            <div className="w-10 h-10 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
              {toToken.mint === 'So11111111111111111111111111111111111111112' ? (
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
                  alt={toToken.tokenInfo.result?.content?.metadata?.symbol || 'Token'}
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
              <span className="font-mono text-lg">{formatNumber(toToken.amount)}</span>
              <Link
                href={route('address', { id: toToken.mint })}
                className="font-mono text-base text-gray-400 hover:text-gray-300 transition-colors"
              >
                {toToken.mint === 'So11111111111111111111111111111111111111112'
                  ? 'SOL'
                  : toToken.tokenInfo?.result?.content?.metadata?.symbol ||
                    `${toToken.mint.slice(0, 4)}...${toToken.mint.slice(-4)}`}
              </Link>
            </div>
            <span className="text-sm text-gray-500">
              ${formatNumber(toToken.amount * (toToken.tokenInfo?.result && 'token_info' in toToken.tokenInfo.result ? toToken.tokenInfo.result.token_info?.price_info?.price_per_token || 0 : 0))}
            </span>
          </div>
        </div>

        {/* Social Metrics */}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
            </svg>
            <span>1.2k</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>400</span>
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
              fromToken.mint === 'So11111111111111111111111111111111111111112'
                ? 'SOL'
                : fromToken.tokenInfo?.result?.content?.metadata?.symbol ||
                  `${fromToken.mint.slice(0, 4)}...${fromToken.mint.slice(-4)}`
            }
            outputTokenName={
              toToken.mint === 'So11111111111111111111111111111111111111112'
                ? 'SOL'
                : toToken.tokenInfo?.result?.content?.metadata?.symbol ||
                  `${toToken.mint.slice(0, 4)}...${toToken.mint.slice(-4)}`
            }
            inputDecimals={
              fromToken.mint === 'So11111111111111111111111111111111111111112'
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
