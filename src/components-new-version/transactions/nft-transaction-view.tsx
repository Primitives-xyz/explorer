import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/avatar'
import { useTokenInfo } from '@/hooks/use-token-info'
import { IGetProfileResponse } from '@/types/profile.types'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { formatNumber } from '@/utils/format'
import { formatTimeAgo } from '@/utils/format-time'
import type { CompressedNFTMintEvent } from '@/utils/helius/types'
import {
  type ExtendedTransaction,
  findNFTMintFromAccounts,
  findNFTMintFromMetaplexInstructions,
  findNFTMintFromTokenTransfers,
  getSaleAmount,
  isNFTBuyTransaction,
  normalizeTransfers,
} from '@/utils/nft-transaction'
import { route } from '@/utils/routes'
import Link from 'next/link'
import { memo, useEffect, useMemo, useState } from 'react'
import { TransactionBadge } from './transaction-badge'
import { TokenAddress } from '@/components/tokens/token-address'

interface NFTTransactionViewProps {
  tx: ExtendedTransaction
  sourceWallet: string
}

export const NFTTransactionView = memo(function NFTTransactionView({
  tx,
  sourceWallet,
}: NFTTransactionViewProps) {
  const [nftMint, setNftMint] = useState<string | null>(null)
  const [_detectionMethod, setDetectionMethod] = useState<string>('')
  const { data: nftInfo, error } = useTokenInfo(nftMint)

  // Add profile lookup for source wallet
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: IGetProfileResponse) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  // Memoize expensive computations
  const { instructions, transfers, compressedNFTMintEvent } = useMemo(() => {
    return {
      instructions: tx.parsedInstructions || tx.instructions || [],
      transfers: normalizeTransfers(tx),
      compressedNFTMintEvent: tx.events?.find(
        (event): event is CompressedNFTMintEvent =>
          event.type === 'COMPRESSED_NFT_MINT'
      ),
    }
  }, [tx])

  // Memoize transaction type calculations
  const { isMint, isBuy, saleAmount } = useMemo(() => {
    const isMint = tx.type === 'COMPRESSED_NFT_MINT' || !!compressedNFTMintEvent
    const isBuy = !isMint && isNFTBuyTransaction(tx, sourceWallet)
    const saleAmount = getSaleAmount(transfers)
    return { isMint, isBuy, saleAmount }
  }, [tx, sourceWallet, compressedNFTMintEvent, transfers])

  // Find the NFT asset from the transaction data
  useEffect(() => {
    // If we have a compressed NFT mint event, use its assetId
    if (compressedNFTMintEvent) {
      setDetectionMethod('compressed_nft_mint')
      setNftMint(compressedNFTMintEvent.assetId)
      return
    }

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
      tx.accountsInvolved
    )
    if (mint) {
      setDetectionMethod('metaplex_core')
      setNftMint(mint)
      return
    }

    // Try to find NFT mint from account data
    const accounts =
      tx.accountData?.map((acc) => acc.account) || tx.accountsInvolved || []
    const accountMint = findNFTMintFromAccounts(accounts, sourceWallet)
    if (accountMint) {
      setDetectionMethod('account_data')
      setNftMint(accountMint)
    }
  }, [tx, sourceWallet, instructions, compressedNFTMintEvent])

  return (
    <div className="space-y-2 p-4 bg-green-900/5 hover:bg-green-900/10 transition-colors rounded-xl border border-green-800/10">
      {/* Transaction Header */}
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
            <span>
              {isMint ? 'minted NFT' : isBuy ? 'bought NFT' : 'sold NFT'}
            </span>
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
      </div>

      {/* Existing NFT details */}
      <div className="flex items-center gap-3 text-sm">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            isMint
              ? 'bg-blue-500/10 text-blue-400'
              : isBuy
              ? 'bg-green-500/10 '
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {isMint ? 'Minted' : isBuy ? 'Bought' : 'Sold'}
        </span>

        {saleAmount > 0 && (
          <div className="flex items-center gap-1">
            <span className=" font-mono font-medium">
              {formatNumber(saleAmount)}
            </span>
            <span className="/80 text-xs">SOL</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs /60">
          {nftMint && (
            <div className="flex items-center gap-1 hover:/80 transition-colors duration-200">
              <span>NFT:</span>
              <TokenAddress address={nftMint} />
            </div>
          )}

          {/* Collection Tag */}
          {nftInfo?.result?.grouping?.find((g) => g.group_key === 'collection')
            ?.group_value && (
            <div className="flex items-center gap-1">
              <span>Collection:</span>
              <TokenAddress
                address={
                  nftInfo.result.grouping.find(
                    (g) => g.group_key === 'collection'
                  )!.group_value
                }
              />
            </div>
          )}

          {/* Compressed NFT Badge */}
          {(tx.type === 'COMPRESSED_NFT_MINT' || compressedNFTMintEvent) && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 ">
              Compressed
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  )
})
