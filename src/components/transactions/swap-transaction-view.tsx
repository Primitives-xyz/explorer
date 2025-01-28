import { formatNumber } from '@/utils/format'
import { Transaction } from '@/utils/helius/types'
import { useEffect, useState } from 'react'
import { TokenInfo } from '@/types/Token'
import Image from 'next/image'
import { JupiterSwapForm } from './jupiter-swap-form'

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
}: {
  tx: Transaction
  sourceWallet: string
}) {
  const [fromToken, setFromToken] = useState<TokenDisplay | null>(null)
  const [toToken, setToToken] = useState<TokenDisplay | null>(null)
  const [showSwapForm, setShowSwapForm] = useState(false)

  useEffect(() => {
    async function loadTokenInfo() {
      // Parse description for initial token info
      // Format can be either:
      // "wallet swapped X SOL for Y TOKEN" or
      // "wallet swapped X TOKEN for Y SOL"
      const descParts = tx.description?.split(' ') || []
      const fromAmount = parseFloat(descParts[2] || '0')
      const toAmount = parseFloat(descParts[5] || '0')
      const fromTokenMint = descParts[3] || ''
      const toTokenMint = descParts[6] || ''

      const SOL_MINT = 'So11111111111111111111111111111111111111112'

      // Check if this is a SOL -> Token swap or Token -> SOL swap
      const isFromSol = fromTokenMint.toLowerCase() === 'sol'
      const isToSol = toTokenMint.toLowerCase() === 'sol'

      if (isFromSol) {
        // SOL -> Token swap
        setFromToken({
          mint: SOL_MINT,
          amount: fromAmount,
        })

        if (toTokenMint) {
          setToToken({
            mint: toTokenMint,
            amount: toAmount,
            loading: true,
          })

          try {
            const response = await fetch(`/api/token?mint=${toTokenMint}`)
            if (!response.ok) {
              throw new Error('Failed to fetch token info')
            }
            const tokenInfo = await response.json()
            setToToken((prev) =>
              prev
                ? {
                    ...prev,
                    tokenInfo,
                    loading: false,
                  }
                : null,
            )
          } catch (error) {
            console.error('Error fetching token info:', error)
            setToToken((prev) =>
              prev
                ? {
                    ...prev,
                    loading: false,
                    error: 'Failed to load token info',
                  }
                : null,
            )
          }
        }
      } else if (isToSol) {
        // Token -> SOL swap
        setToToken({
          mint: SOL_MINT,
          amount: toAmount,
        })

        if (fromTokenMint) {
          setFromToken({
            mint: fromTokenMint,
            amount: fromAmount,
            loading: true,
          })

          try {
            const response = await fetch(`/api/token?mint=${fromTokenMint}`)
            if (!response.ok) {
              throw new Error('Failed to fetch token info')
            }
            const tokenInfo = await response.json()
            setFromToken((prev) =>
              prev
                ? {
                    ...prev,
                    tokenInfo,
                    loading: false,
                  }
                : null,
            )
          } catch (error) {
            console.error('Error fetching token info:', error)
            setFromToken((prev) =>
              prev
                ? {
                    ...prev,
                    loading: false,
                    error: 'Failed to load token info',
                  }
                : null,
            )
          }
        }
      }
    }

    loadTokenInfo()
  }, [tx, sourceWallet])

  if (!fromToken || !toToken) return null

  return (
    <div className="space-y-4">
      {/* Swap Interface Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowSwapForm(!showSwapForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showSwapForm ? 'View Swap History' : 'New Swap'}
        </button>
      </div>

      {showSwapForm ? (
        <JupiterSwapForm
          initialInputMint={fromToken.mint}
          initialOutputMint={toToken.mint}
          initialAmount={fromToken.amount.toString()}
        />
      ) : (
        <div className="flex items-center gap-2 p-2 bg-green-900/10 rounded-lg">
          {/* From Token */}
          <div className="flex-1 flex items-center gap-2">
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
                ) : fromToken.loading ? (
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
                ) : fromToken.loading ? (
                  <div className="animate-pulse w-16 h-4 bg-green-500/20 rounded" />
                ) : (
                  fromToken.tokenInfo?.result?.content?.metadata?.symbol ||
                  `${fromToken.mint.slice(0, 4)}...${fromToken.mint.slice(-4)}`
                )}
              </span>
            </div>
          </div>

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
          <div className="flex-1 flex items-center gap-2">
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
                ) : toToken.loading ? (
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
                ) : toToken.loading ? (
                  <div className="animate-pulse w-16 h-4 bg-green-500/20 rounded" />
                ) : (
                  toToken.tokenInfo?.result?.content?.metadata?.symbol ||
                  `${toToken.mint.slice(0, 4)}...${toToken.mint.slice(-4)}`
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
