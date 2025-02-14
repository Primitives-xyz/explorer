import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/Avatar'
import { Modal } from '@/components/common/modal'
import { useTokenInfo } from '@/hooks/use-token-info'
import type { TokenInfo } from '@/types/Token'
import type { Profile } from '@/utils/api'
import { formatNumber } from '@/utils/format'
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
      {/* Transaction Header - Social Style */}
      <div className="flex items-center justify-between p-3 bg-green-900/10 rounded-lg border border-green-500/10">
        <div className="flex items-center gap-3">
          <Avatar
            username={sourceProfile?.username || sourceWallet}
            size={40}
            imageUrl={sourceProfile?.image}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {sourceProfile?.username ? (
                <Link
                  href={route('address', { id: sourceProfile.username })}
                  className="text-sm font-semibold hover:text-green-400 transition-colors"
                >
                  @{sourceProfile.username}
                </Link>
              ) : (
                <Link
                  href={route('address', { id: sourceWallet })}
                  className="text-sm font-mono hover:text-green-400 transition-colors"
                >
                  {sourceWallet.slice(0, 4)}...{sourceWallet.slice(-4)}
                </Link>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {new Date(tx.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
        {!isOwnTrade && (
          <button
            onClick={() => setShowSwapModal(true)}
            className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg transition-colors text-sm border border-green-500/20"
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
        <div className="flex items-center gap-4">
          {/* From Token */}
          <div className="flex-1">
            <Link
              href={route('address', { id: fromToken.mint })}
              className="flex items-center gap-3 p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
                <div className="w-9 h-9 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
                  {fromToken.mint ===
                  'So11111111111111111111111111111111111111112' ? (
                    <Image
                      src="/images/solana-icon.svg"
                      alt="solana icon"
                      width={22}
                      height={22}
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
                      className="w-7 h-7 rounded-lg group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <span className="font-mono text-xs">
                      {fromToken.mint.slice(0, 2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-mono text-base">
                  {formatNumber(fromToken.amount)}
                </span>
                <span className="font-mono text-sm">
                  {fromToken.mint ===
                  'So11111111111111111111111111111111111111112' ? (
                    'SOL'
                  ) : fromTokenLoading ? (
                    <div className="animate-pulse w-14 h-3.5 bg-green-500/20 rounded" />
                  ) : (
                    fromToken.tokenInfo?.result?.content?.metadata?.symbol ||
                    `${fromToken.mint.slice(0, 4)}...${fromToken.mint.slice(
                      -4
                    )}`
                  )}
                </span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={14} className="text-gray-500" />
              </div>
            </Link>
          </div>

          {/* Swap Icon */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="w-7 h-7 bg-green-900/30 rounded-full flex items-center justify-center">
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
            </div>
            <span className="text-[10px] text-gray-500">swap</span>
          </div>

          {/* To Token */}
          <div className="flex-1">
            <Link
              href={route('address', { id: toToken.mint })}
              className="flex items-center gap-3 p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
                <div className="w-9 h-9 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
                  {toToken.mint ===
                  'So11111111111111111111111111111111111111112' ? (
                    <Image
                      src="/images/solana-icon.svg"
                      alt="solana icon"
                      width={22}
                      height={22}
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
                      className="w-7 h-7 rounded-lg group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <span className="font-mono text-xs">
                      {toToken.mint.slice(0, 2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-mono text-base">
                  {formatNumber(toToken.amount)}
                </span>
                <span className="font-mono text-sm">
                  {toToken.mint ===
                  'So11111111111111111111111111111111111111112' ? (
                    'SOL'
                  ) : toTokenLoading ? (
                    <div className="animate-pulse w-14 h-3.5 bg-green-500/20 rounded" />
                  ) : (
                    toToken.tokenInfo?.result?.content?.metadata?.symbol ||
                    `${toToken.mint.slice(0, 4)}...${toToken.mint.slice(-4)}`
                  )}
                </span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={14} className="text-gray-500" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        title={
          sourceProfile?.username
            ? `Copy Trade by @${sourceProfile.username}`
            : 'Copy Trade'
        }
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
