import { useEffect, useState } from 'react'
import { Transaction } from '@/utils/helius/types'
import { formatNumber } from '@/utils/format'

interface TokenTransfer {
  tokenMint: string
  from: string
  to: string
  amount: number
}

interface SPLTransferViewProps {
  tx: Transaction
  sourceWallet: string
}

interface TokenDisplay {
  loading: boolean
  error?: string
  tokenInfo?: {
    jsonrpc: string
    result: {
      interface: string
      id: string
      content: {
        metadata: {
          name: string
          symbol: string
        }
        links?: {
          image?: string
        }
      }
      token_info?: {
        symbol: string
        decimals: number
        supply?: number
        price_info?: {
          price_per_token: number
          currency: string
        }
      }
    }
  } | null
}

export const SPLTransferView = ({ tx, sourceWallet }: SPLTransferViewProps) => {
  const [tokenInfo, setTokenInfo] = useState<TokenDisplay | null>(null)

  useEffect(() => {
    console.log('SPL Transfer View Props:', {
      tokenTransfers: tx.tokenTransfers,
      sourceWallet,
      description: tx.description,
    })

    const loadTokenInfo = async () => {
      if (!tx.tokenTransfers?.length) {
        console.log('No token transfers found')
        return
      }

      const transfer = tx.tokenTransfers[0]
      console.log('First transfer:', transfer)

      if (!transfer.tokenMint) {
        console.log('No token mint found in transfer:', transfer)
        return
      }

      console.log('Loading token info for:', {
        mint: transfer.tokenMint,
        amount: transfer.amount,
        transfer,
      })

      setTokenInfo((prev) =>
        prev ? { ...prev, loading: true } : { loading: true },
      )

      try {
        const response = await fetch(`/api/token?mint=${transfer.tokenMint}`)

        if (!response.ok) {
          throw new Error('Failed to fetch token info')
        }

        const data = await response.json()

        setTokenInfo((prev) => ({
          ...(prev || {}),
          loading: false,
          tokenInfo: data,
        }))
      } catch (error) {
        console.error('Error fetching token info:', error)
        setTokenInfo((prev) =>
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

    loadTokenInfo()
  }, [tx])

  if (!tx.tokenTransfers?.length || !tokenInfo) {
    console.log('No token transfers or token info:', {
      hasTransfers: !!tx.tokenTransfers?.length,
      tokenInfo,
      firstTransfer: tx.tokenTransfers?.[0],
    })
    return null
  }

  return (
    <div className="space-y-2 p-4 bg-green-900/5 hover:bg-green-900/10 transition-colors rounded-xl border border-green-800/10">
      {tx.tokenTransfers.map((transfer: TokenTransfer, index: number) => {
        const isFungibleToken =
          tokenInfo.tokenInfo?.result.interface === 'FungibleToken'
        const tokenSymbol =
          tokenInfo.tokenInfo?.result.content.metadata.symbol || 'tokens'
        const pricePerToken =
          tokenInfo.tokenInfo?.result.token_info?.price_info?.price_per_token
        const totalValue = pricePerToken
          ? transfer.amount * pricePerToken
          : null
        const isReceiving = transfer.to === sourceWallet

        return (
          <div key={index} className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/5 rounded-xl filter blur-sm"></div>
              <div className="w-12 h-12 rounded-xl bg-black/20 ring-1 ring-green-500/10 flex items-center justify-center relative z-[1]">
                {tokenInfo.loading ? (
                  <div className="animate-pulse w-8 h-8 bg-green-500/20 rounded-lg" />
                ) : tokenInfo.tokenInfo?.result.content.links?.image ? (
                  <img
                    src={tokenInfo.tokenInfo.result.content.links.image}
                    alt={tokenSymbol}
                    className="w-8 h-8 rounded-lg object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500 font-semibold">
                      {tokenSymbol.slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      isReceiving ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {isReceiving ? 'Received' : 'Sent'}
                  </span>
                  <span className="text-green-600 font-mono text-sm">
                    {tokenSymbol}
                  </span>
                </div>
                <span className="text-green-600/60 font-mono text-xs">
                  {isReceiving
                    ? `From: ${transfer.from?.slice(
                        0,
                        4,
                      )}...${transfer.from?.slice(-4)}`
                    : `To: ${transfer.to?.slice(0, 4)}...${transfer.to?.slice(
                        -4,
                      )}`}
                </span>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className="text-green-400 font-mono font-medium">
                  {formatNumber(transfer.amount)} {tokenSymbol}
                </span>
                {totalValue && (
                  <span className="text-green-600/60 font-mono text-xs">
                    ≈ ${formatNumber(totalValue, 2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
