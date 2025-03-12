import NFTDetails from '@/components/NFT-details'
import { FungibleTokenDetailsWrapper } from '@/components/tokens/fungible-token-details-wrapper'
import { WalletView } from '@/components/wallet/wallet-view'
import type { FungibleTokenInfo, NFTTokenInfo } from '@/types/Token'

import type { TokenInfo } from '@/types/Token'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import NFTCollectionDetail from '../NFT-collection-details'

/**
 * Handles token-related views
 * 1. Fetches token info
 * 2. Determines if it's a fungible token or NFT
 * 3. Falls back to wallet view if token fetch fails
 */
export async function TokenView({ id }: { id: string }) {
  const tokenInfo: TokenInfo | null = await fetchTokenInfo(id)

  if (!tokenInfo) {
    return <WalletView address={id} />
  }

  const groupingInfos = tokenInfo.result?.grouping

  if (groupingInfos) {
    const [groupingInfo] = groupingInfos
    if (groupingInfo?.hasOwnProperty('group_key')) {
      if (tokenInfo.result?.interface) {
        if (['FungibleToken', 'FungibleAsset'].includes(tokenInfo.result?.interface)) {
          return (
            <FungibleTokenDetailsWrapper
              id={id}
              tokenInfo={tokenInfo.result as FungibleTokenInfo}
            />
          )
        } else {
          return <NFTDetails tokenInfo={tokenInfo.result as NFTTokenInfo} />
        }
      } else {
        return <WalletView address={id} />
      }
    } else {
      return <NFTCollectionDetail id={id} tokenInfo={tokenInfo.result as NFTTokenInfo} />
    }
  } else {
    return <WalletView address={id} />
  }
}
