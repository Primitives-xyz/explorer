import type { FungibleToken, NFT } from '@/utils/types'
import { NFTSection } from './NFTSection'
import { TokenSection } from './TokenSection'

interface TokenContainerProps {
  hasSearched?: boolean
  tokenType?: 'all' | 'fungible' | 'nft' | 'compressed' | 'programmable'
  hideTitle?: boolean
  isLoading: boolean
  tokenData?: TokenData
  error?: string
}

interface TokenData {
  items: (FungibleToken | NFT)[]
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

const EmptyState = ({ type }: { type: 'nft' | 'token' }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-green-500/20 bg-black/20">
    <div className="text-3xl mb-2">{type === 'nft' ? '🖼️' : '💰'}</div>
    <h3 className="text-lg font-medium text-green-300 mb-2">
      No {type === 'nft' ? 'NFTs' : 'tokens'} found
    </h3>
    <p className="text-sm text-green-600">
      {type === 'nft'
        ? "This wallet doesn't have any NFTs yet"
        : "This wallet doesn't have any tokens yet"}
    </p>
  </div>
)

const filterNFTs = (items: (FungibleToken | NFT)[], tokenType: string) => {
  return items.filter((item: FungibleToken | NFT) => {
    // Exclude fungible tokens
    if (
      item.interface === 'FungibleToken' ||
      item.interface === 'FungibleAsset'
    ) {
      return false
    }

    switch (tokenType) {
      case 'nft':
        return (
          ['V1_NFT', 'V2_NFT', 'LEGACY_NFT', 'MplCoreAsset'].includes(
            item.interface,
          ) && !item.compressed
        )
      case 'compressed':
        return ['V1_NFT', 'V2_NFT'].includes(item.interface) && item.compressed
      case 'programmable':
        return item.interface === 'ProgrammableNFT'
      case 'all':
      default:
        return true
    }
  })
}

const filterTokens = (items: (FungibleToken | NFT)[]) => {
  return items.filter(
    (item) =>
      item.interface === 'FungibleToken' || item.interface === 'FungibleAsset',
  )
}

export const TokenContainer = ({
  hasSearched,
  tokenType = 'all',
  hideTitle = false,
  tokenData,
  isLoading,
  error,
}: TokenContainerProps) => {
  const filteredNFTs = tokenData?.items
    ? filterNFTs(tokenData.items, tokenType)
    : []
  const filteredTokens = tokenData?.items ? filterTokens(tokenData.items) : []

  if (tokenType === 'nft') {
    return (
      <div className="flex flex-col space-y-6">
        {!isLoading && !error && filteredNFTs.length === 0 ? (
          <EmptyState type="nft" />
        ) : (
          <div>
            <NFTSection
              hasSearched={hasSearched}
              tokenType={tokenType}
              hideTitle={hideTitle}
              isLoading={isLoading}
              error={error}
              items={filteredNFTs}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {!isLoading && !error && filteredTokens.length === 0 ? (
        <EmptyState type="token" />
      ) : (
        <TokenSection
          tokenType={tokenType}
          hideTitle={hideTitle}
          isLoading={isLoading}
          error={error}
          items={filteredTokens}
        />
      )}
    </div>
  )
}
