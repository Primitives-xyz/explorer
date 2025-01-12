import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Transaction } from '@/utils/helius/types'
import { TokenInfo } from '@/types/Token'
import { formatNumber } from '@/utils/format'

interface Transfer {
  to: string
  from: string
  amount: number
}

interface NFTMetadata {
  name: string
  symbol: string
  description: string
  collection?: {
    name: string
  }
}

interface NFTTransactionViewProps {
  tx: Transaction & {
    transfers?: Transfer[]
  }
  sourceWallet: string
}

export function NFTTransactionView({
  tx,
  sourceWallet,
}: NFTTransactionViewProps) {
  const [nftMint, setNftMint] = useState<string | null>(null)
  const [nftInfo, setNftInfo] = useState<TokenInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('NFT Transaction:', {
    tx,
    sourceWallet,
    type: tx.type,
    source: tx.source,
    description: tx.description,
    transfers: tx.transfers,
    tokenTransfers: tx.tokenTransfers,
  })

  // Determine if this is a buy or sell based on the source wallet
  const isBuy =
    tx.type === 'DEPOSIT' ||
    (tx.transfers && tx.transfers.some((t) => t.to === sourceWallet))

  // Get the SOL amount from the transaction
  const solAmount =
    tx.transfers?.reduce((acc, t) => {
      if (t.amount && typeof t.amount === 'number') {
        return acc + t.amount
      }
      return acc
    }, 0) || 0

  useEffect(() => {
    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      console.log('Token Transfers:', tx.tokenTransfers)
      const possibleNFT = tx.tokenTransfers.find(
        (t) => t.tokenStandard === 'NonFungible',
      )
      if (possibleNFT) {
        console.log('Found NFT:', possibleNFT)
        setNftMint(possibleNFT.mint)
      } else {
        console.log('No NFT found in token transfers')
      }
    } else {
      console.log('No token transfers found')
    }
  }, [tx])

  useEffect(() => {
    async function fetchNFT() {
      if (!nftMint) return
      setLoading(true)
      setError(null)
      try {
        console.log('Fetching NFT info for mint:', nftMint)
        const response = await fetch(`/api/token?mint=${nftMint}`)
        if (!response.ok) {
          throw new Error('Failed to fetch NFT info')
        }
        const data = await response.json()
        console.log('NFT Info received:', data)
        setNftInfo(data)
      } catch (err) {
        console.error('Error fetching NFT:', err)
        setError(`Error: ${(err as Error).message}`)
      } finally {
        setLoading(false)
      }
    }
    fetchNFT()
  }, [nftMint])

  if (!nftMint) {
    console.log('No NFT mint found, returning null')
    return null
  }

  console.log('Rendering NFT view with:', {
    nftMint,
    nftInfo,
    isBuy,
    solAmount,
    loading,
    error,
  })

  return (
    <div className="p-4 bg-gradient-to-r from-green-900/10 to-green-900/5 rounded-lg">
      <div className="flex items-start gap-4">
        {/* NFT Image Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-lg"></div>
          <div className="w-16 h-16 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1] overflow-hidden">
            {loading ? (
              <div className="animate-pulse w-full h-full bg-green-500/20" />
            ) : nftInfo?.result?.content?.links?.image ? (
              <img
                src={nftInfo.result.content.links.image}
                alt={nftInfo.result?.content?.metadata?.symbol || 'NFT'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-green-500 font-mono text-xs flex items-center justify-center w-full h-full">
                NFT
              </div>
            )}
          </div>
        </div>

        {/* NFT Details Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                isBuy
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isBuy ? 'Purchased' : 'Sold'}
            </span>
            {solAmount > 0 && (
              <span className="text-green-400 font-mono text-sm">
                {formatNumber(solAmount)} SOL
              </span>
            )}
          </div>

          <h3 className="text-green-300 font-medium truncate">
            {nftInfo?.result?.content?.metadata?.name ||
              `NFT ${nftMint.slice(0, 4)}...${nftMint.slice(-4)}`}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-xs text-green-600">
            <span className="truncate">
              {(nftInfo?.result?.content?.metadata as NFTMetadata)?.collection
                ?.name || 'Unknown Collection'}
            </span>
            {tx.source && (
              <span className="px-1.5 py-0.5 rounded-full bg-green-900/30 uppercase">
                {tx.source}
              </span>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mt-2 text-red-400 text-xs">{error}</div>}
    </div>
  )
}
