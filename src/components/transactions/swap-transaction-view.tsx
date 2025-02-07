import { formatNumber } from '@/utils/format'
import type { Transaction } from '@/utils/helius/types'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { TokenInfo } from '@/types/Token'
import Image from 'next/image'
import { JupiterSwapForm } from './jupiter-swap-form'
import { Modal } from '@/components/common/modal'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useTokenInfo } from '@/hooks/use-token-info'
import dynamic from 'next/dynamic'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton,
    ),
  { ssr: false },
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
  const { isLoggedIn } = useCurrentWallet()

  // Add useTokenInfo hooks for both tokens
  const { data: fromTokenInfo, loading: fromTokenLoading } = useTokenInfo(
    fromToken?.mint === 'So11111111111111111111111111111111111111112'
      ? null
      : fromToken?.mint,
  )
  const { data: toTokenInfo, loading: toTokenLoading } = useTokenInfo(
    toToken?.mint === 'So11111111111111111111111111111111111111112'
      ? null
      : toToken?.mint,
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
        prev ? { ...prev, tokenInfo: fromTokenInfo } : null,
      )
    }
  }, [fromTokenInfo])

  useEffect(() => {
    if (toToken && toTokenInfo) {
      setToToken((prev) => (prev ? { ...prev, tokenInfo: toTokenInfo } : null))
    }
  }, [toTokenInfo])

  if (!fromToken || !toToken) return null

  return (
    <div className="space-y-4">
      {/* Swap Interface Toggle */}
      <div className="flex justify-end">
        {isLoggedIn ? (
          <button
            onClick={() => setShowSwapModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors min-w-full"
          >
            Copy Trade
          </button>
        ) : (
          <div className="min-w-full">
            <DynamicConnectButton
              buttonContainerClassName="min-w-full"
              buttonClassName="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer min-w-full"
            >
              Copy Trade
            </DynamicConnectButton>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-2 bg-green-900/10 rounded-lg">
        {/* From Token */}
        <Link
          href={`/${fromToken.mint}`}
          className="flex-1 flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label={`View token ${
            fromToken.tokenInfo?.result?.content?.metadata?.symbol ||
            fromToken.mint
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
            <div className="w-8 h-8 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
              {fromToken.mint ===
              'So11111111111111111111111111111111111111112' ? (
                <Image
                  src="/images/solana-icon.svg"
                  alt="solana icon"
                  width={20}
                  height={20}
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
                  className="w-6 h-6 rounded-lg"
                />
              ) : (
                <span className="text-green-500 font-mono text-xs">
                  {fromToken.mint.slice(0, 2)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-green-400 font-mono text-xs">
              {formatNumber(fromToken.amount)}
            </span>
            <span className="text-green-600 font-mono text-xs">
              {fromToken.mint ===
              'So11111111111111111111111111111111111111112' ? (
                'SOL'
              ) : fromTokenLoading ? (
                <div className="animate-pulse w-16 h-4 bg-green-500/20 rounded" />
              ) : (
                fromToken.tokenInfo?.result?.content?.metadata?.symbol ||
                `${fromToken.mint.slice(0, 4)}...${fromToken.mint.slice(-4)}`
              )}
            </span>
          </div>
        </Link>

        {/* Swap Icon */}
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-green-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-500"
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
        </div>

        {/* To Token */}
        <Link
          href={`/${toToken.mint}`}
          className="flex-1 flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label={`View token ${
            toToken.tokenInfo?.result?.content?.metadata?.symbol || toToken.mint
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
            <div className="w-8 h-8 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
              {toToken.mint ===
              'So11111111111111111111111111111111111111112' ? (
                <Image
                  src="/images/solana-icon.svg"
                  alt="solana icon"
                  width={20}
                  height={20}
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
                  className="w-6 h-6 rounded-lg"
                />
              ) : (
                <span className="text-green-500 font-mono text-xs">
                  {toToken.mint.slice(0, 2)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-green-400 font-mono text-xs">
              {formatNumber(toToken.amount)}
            </span>
            <span className="text-green-600 font-mono text-xs">
              {toToken.mint ===
              'So11111111111111111111111111111111111111112' ? (
                'SOL'
              ) : toTokenLoading ? (
                <div className="animate-pulse w-16 h-4 bg-green-500/20 rounded" />
              ) : (
                toToken.tokenInfo?.result?.content?.metadata?.symbol ||
                `${toToken.mint.slice(0, 4)}...${toToken.mint.slice(-4)}`
              )}
            </span>
          </div>
        </Link>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        title="Repeat Swap"
      >
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
              ? 9 // SOL decimals
              : fromToken.tokenInfo?.result &&
                'token_info' in fromToken.tokenInfo.result
              ? fromToken.tokenInfo.result.token_info?.decimals ?? 9
              : 9
          }
          sourceWallet={sourceWallet}
        />
      </Modal>
    </div>
  )
}
