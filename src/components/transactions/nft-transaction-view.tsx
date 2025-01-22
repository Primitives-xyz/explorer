import { useEffect, useState } from 'react'
import { TokenResponse } from '@/types/Token'
import { formatNumber } from '@/utils/format'
import { TokenAddress } from '../tokens/TokenAddress'
import {
  ExtendedTransaction,
  findNFTMintFromTokenTransfers,
  findNFTMintFromMetaplexInstructions,
  findNFTMintFromAccounts,
  getSaleAmount,
  isNFTBuyTransaction,
  normalizeTransfers,
} from '@/utils/nft-transaction'

interface NFTTransactionViewProps {
  tx: ExtendedTransaction
  sourceWallet: string
}

export function NFTTransactionView({
  tx,
  sourceWallet,
}: NFTTransactionViewProps) {
  const [nftMint, setNftMint] = useState<string | null>(null)
  const [nftInfo, setNftInfo] = useState<TokenResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectionMethod, setDetectionMethod] = useState<string>('')

  // Normalize the transaction format
  const instructions = tx.parsedInstructions || tx.instructions || []
  const transfers = normalizeTransfers(tx)

  // Check if this is a Metaplex Core Program transfer
  const isMetaplexCoreTransfer = instructions?.some((ix) =>
    ix.accounts?.includes('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'),
  )

  // Find the NFT asset from the transaction data
  useEffect(() => {
    // Try to find NFT mint from token transfers
    let mint = findNFTMintFromTokenTransfers(tx)
    if (mint) {
      setDetectionMethod('token_transfer')
      setNftMint(mint)
      return
    }

    // Try to find NFT mint from Metaplex instructions
    mint = findNFTMintFromMetaplexInstructions(
      instructions,
      sourceWallet,
      tx.accountsInvolved,
    )
    if (mint) {
      setDetectionMethod('metaplex_core')
      setNftMint(mint)
      return
    }

    // Try to find NFT mint from account data
    const accounts =
      tx.accountData?.map((acc) => acc.account) || tx.accountsInvolved || []
    mint = findNFTMintFromAccounts(accounts, sourceWallet)
    if (mint) {
      setDetectionMethod('account_data')
      setNftMint(mint)
    }
  }, [tx, sourceWallet, instructions])

  // Determine if this is a buy or sell
  const isBuy = isNFTBuyTransaction(tx, sourceWallet)

  // Get the actual sale amount
  const saleAmount = getSaleAmount(transfers)

  useEffect(() => {
    async function fetchNFT() {
      if (!nftMint) return
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/token?mint=${nftMint}`).catch(() => {
          throw new Error('Network error while fetching NFT data')
        })

        if (!response?.ok) {
          throw new Error(
            `HTTP error! status: ${response?.status || 'unknown'}`,
          )
        }

        let data
        try {
          data = await response.json()
        } catch (parseError) {
          throw new Error('Failed to parse NFT data')
        }

        if (!data || 'error' in data) {
          throw new Error(data?.error || 'Invalid NFT data received')
        }

        setNftInfo(data)
      } catch (err) {
        console.error('Error fetching NFT:', err)
        setError(err instanceof Error ? err.message : 'Failed to load NFT data')
        setNftInfo(null)
      } finally {
        setLoading(false)
      }
    }
    fetchNFT()
  }, [nftMint])

  return (
    <div className="group relative overflow-hidden transition-all duration-200 hover:scale-[1.01] p-3 bg-gradient-to-r from-green-950/40 to-green-900/20 rounded-lg border border-green-800/20 hover:border-green-700/30">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="flex items-center gap-3 relative z-10">
        {/* NFT Image Section */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-lg" />
          <div className="w-12 h-12 rounded-lg bg-black/40 ring-1 ring-green-500/30 group-hover:ring-green-400/40 transition-all duration-200 flex items-center justify-center relative overflow-hidden">
            {loading ? (
              <div className="animate-pulse w-full h-full bg-gradient-to-br from-green-900/40 to-green-800/20" />
            ) : nftInfo?.result?.content?.links?.image ? (
              <img
                src={nftInfo.result.content.links.image}
                alt={nftInfo.result.content.metadata.symbol || 'NFT'}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              />
            ) : (
              <div className="text-green-500 font-mono text-xs flex items-center justify-center w-full h-full bg-gradient-to-br from-green-900/40 to-green-800/20">
                NFT
              </div>
            )}
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 min-w-0">
          {/* Top Row - Name and Symbol */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-green-200 font-medium text-sm truncate">
              {nftInfo?.result?.content?.metadata?.name ||
                `NFT ${nftMint?.slice(0, 4)}...${nftMint?.slice(-4)}`}
            </h3>
            {nftInfo?.result?.content?.metadata?.symbol && (
              <span className="text-green-500/60 text-xs whitespace-nowrap">
                ({nftInfo.result.content.metadata.symbol})
              </span>
            )}
          </div>

          {/* Bottom Row */}
          <div className="flex items-center gap-3 text-sm">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isBuy
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {isBuy ? 'Bought' : 'Sold'}
            </span>

            {saleAmount > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-green-300 font-mono font-medium">
                  {formatNumber(saleAmount)}
                </span>
                <span className="text-green-400/80 text-xs">SOL</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-green-500/60">
              {nftMint && (
                <div className="flex items-center gap-1 hover:text-green-400/80 transition-colors duration-200">
                  <span>NFT:</span>
                  <TokenAddress address={nftMint} />
                </div>
              )}

              {/* Collection Tag */}
              {nftInfo?.result?.grouping?.find(
                (g) => g.group_key === 'collection',
              )?.group_value && (
                <div className="flex items-center gap-1">
                  <span>Collection:</span>
                  <TokenAddress
                    address={
                      nftInfo.result.grouping.find(
                        (g) => g.group_key === 'collection',
                      )!.group_value
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  )
}
