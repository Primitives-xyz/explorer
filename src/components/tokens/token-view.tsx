import NFTDetails from '@/components/NFT-details'
import { FungibleTokenDetailsWrapper } from '@/components/tokens/fungible-token-details-wrapper'
import { WalletView } from '@/components/wallet/wallet-view'
import type { FungibleTokenInfo, NFTTokenInfo } from '@/types/Token'

import NFTCollectionDetail from '@/components/nft/NFT-collection-details'
import type { TokenInfo } from '@/types/Token'
import { fetchTokenInfo } from '@/utils/helius/das-api'

/**
 * Handles token-related views
 * 1. Fetches token info
 * 2. Determines if it's a fungible token or NFT
 * 3. Falls back to wallet view if token fetch fails
 */
export async function TokenView({ id }: { id: string }) {
  let tokenInfo: TokenInfo | null = null
  try {
    tokenInfo = await fetchTokenInfo(id)
  } catch (error) {
    console.error('Error fetching token info:', error)
    return <WalletView address={id} />
  }

  // If no token info found, treat as a wallet
  if (!tokenInfo?.result) {
    return <WalletView address={id} />
  }
  const tokenInterface = tokenInfo?.result?.interface
  //log interface
  console.log('Interface:', tokenInterface)
  // Determine token type and render appropriate view
  const isFungibleToken = tokenInterface === 'FungibleToken'
  const isFungibleAsset = tokenInterface === 'FungibleAsset'

  if (isFungibleToken || isFungibleAsset) {
    return (
      <FungibleTokenDetailsWrapper
        id={id}
        tokenInfo={tokenInfo.result as FungibleTokenInfo}
      />
    )
  }

  // Check if it's an NFT collection
  const groupingInfos = tokenInfo.result?.grouping

  if (
    tokenInterface === 'MplCoreCollection' ||
    (groupingInfos && groupingInfos.length === 0)
  ) {
    const [groupingInfo] = groupingInfos || []
    if (!groupingInfo?.hasOwnProperty('group_key')) {
      return (
        <NFTCollectionDetail
          id={id}
          tokenInfo={tokenInfo.result as NFTTokenInfo}
        />
      )
    }
  }

  return <NFTDetails tokenInfo={tokenInfo.result as NFTTokenInfo} />
}
