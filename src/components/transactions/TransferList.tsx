import { formatLamportsToSol, formatAddress, formatTokenAmount } from '@/utils/transaction'
import Image from 'next/image'
import { useEffect, useState } from 'react'

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
  decimals?: number
}

interface TokenInfo {
  symbol: string
  name: string
  imageUrl?: string
  decimals?: number
}

interface TransferListProps {
  nativeTransfers?: Transfer[]
  tokenTransfers?: TokenTransfer[]
  sourceWallet: string
  type?: string
}

export const TransferList = ({
  nativeTransfers,
  tokenTransfers,
  sourceWallet,
  type,
}: TransferListProps) => {
  const [tokenInfoMap, setTokenInfoMap] = useState<Record<string, TokenInfo>>({})

  useEffect(() => {
    const fetchTokenInfo = async (mint: string) => {
      try {
        const response = await fetch(`/api/token-info?mint=${mint}`)
        if (response.ok) {
          const data = await response.json()
          setTokenInfoMap(prev => ({
            ...prev,
            [mint]: {
              symbol: data.symbol || 'Unknown',
              name: data.name || 'Unknown Token',
              imageUrl: data.image || null,
              decimals: data.decimals || 0
            }
          }))
        }
      } catch (error) {
        console.error('Error fetching token info:', error)
      }
    }

    tokenTransfers?.forEach(transfer => {
      if (transfer.mint && !tokenInfoMap[transfer.mint]) {
        fetchTokenInfo(transfer.mint)
      }
    })
  }, [tokenTransfers])

  const isSwap = type?.toUpperCase() === 'SWAP'

  return (
    <div className="space-y-2">
      {/* Native SOL Transfers */}
      {nativeTransfers
        ?.filter((transfer) => transfer.amount > 0)
        .map((transfer, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded-md bg-green-900/10"
          >
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image
                src="/images/solana-icon.svg"
                alt="SOL"
                layout="fill"
                className="rounded-full"
              />
            </div>
            <div className="flex-grow">
              <div className="text-xs text-green-500 font-mono flex items-center gap-1">
                <span>{transfer.fromUserAccount === sourceWallet ? '↑' : '↓'}</span>
                <span className="font-semibold">{formatLamportsToSol(transfer.amount)} SOL</span>
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
            </div>
          </div>
        ))}

      {/* Token Transfers */}
      {tokenTransfers
        ?.filter((transfer) => transfer.tokenAmount && transfer.tokenAmount > 0)
        .map((transfer, i) => {
          const targetAddress =
            transfer.fromUserAccount === sourceWallet
              ? transfer.toUserAccount
              : transfer.fromUserAccount
          
          const tokenInfo = transfer.mint ? tokenInfoMap[transfer.mint] : null
          const isOutgoing = transfer.fromUserAccount === sourceWallet
          const decimals = transfer.decimals || tokenInfo?.decimals || 0

          return (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded-md bg-green-900/10"
            >
              <div className="w-8 h-8 relative flex-shrink-0">
                {tokenInfo?.imageUrl ? (
                  <Image
                    src={tokenInfo.imageUrl}
                    alt={tokenInfo.symbol}
                    layout="fill"
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-green-900/20 rounded-full flex items-center justify-center text-xs text-green-500">
                    ?
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="text-xs text-green-500 font-mono flex items-center gap-1">
                  <span>{isSwap ? (isOutgoing ? '-' : '+') : (isOutgoing ? '↑' : '↓')}</span>
                  <span className="font-semibold">
                    {formatTokenAmount(transfer.tokenAmount, decimals)}{' '}
                    {tokenInfo?.symbol || formatAddress(transfer.mint || '')}
                  </span>
                  {!isSwap && (
                    <>
                      <span className="text-green-700">
                        {isOutgoing ? 'to' : 'from'}
                      </span>
                      {targetAddress && (
                        <a
                          href={`https://solscan.io/account/${targetAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-400 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {formatAddress(targetAddress)}
                        </a>
                      )}
                    </>
                  )}
                </div>
                {tokenInfo?.name && (
                  <div className="text-xs text-green-700 font-mono mt-0.5">
                    {tokenInfo.name}
                  </div>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
