import { FungibleToken, NFT } from '@/utils/types'
import { NFTSection } from './NFTSection'
import { TokenSection } from './TokenSection'
import { TransactionSection } from './TransactionSection'
import { SolBalanceSection } from './tokens/SolBalanceSection'

interface TokenContainerProps {
  walletAddress: string
  hasSearched?: boolean
  tokenType?: 'all' | 'fungible' | 'nft' | 'compressed' | 'programmable'
  hideTitle?: boolean
  view?: 'tokens' | 'nfts'
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
  walletAddress,
  hasSearched,
  tokenType = 'all',
  hideTitle = false,
  view = 'tokens',
  tokenData,
  isLoading,
  error,
}: TokenContainerProps) => {
  if (view === 'nfts') {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="min-w-0">
          <NFTSection
            walletAddress={walletAddress}
            hasSearched={hasSearched}
            tokenType={tokenType}
            hideTitle={hideTitle}
            isLoading={isLoading}
            error={error}
            items={
              tokenData?.items ? filterNFTs(tokenData.items, tokenType) : []
            }
          />
        </div>
        <div className="min-w-0">
          <TransactionSection
            walletAddress={walletAddress}
            hasSearched={hasSearched}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SolBalanceSection
        walletAddress={walletAddress}
        hideTitle={hideTitle}
        isLoading={isLoading}
        error={error}
        nativeBalance={tokenData?.nativeBalance}
      />
      <TokenSection
        tokenType={tokenType}
        hideTitle={hideTitle}
        isLoading={isLoading}
        error={error}
        items={tokenData?.items ? filterTokens(tokenData.items) : []}
      />
    </div>
  )
}
