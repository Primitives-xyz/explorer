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
  let tokenInfo: TokenInfo | null = null

  try {
    tokenInfo = await fetchTokenInfo(id)

    // Debug log to see token info structure
    console.log(
      'Token info:',
      JSON.stringify(
        {
          id,
          interface: tokenInfo?.result?.interface,
          hasGrouping: !!tokenInfo?.result?.grouping,
          groupingLength: tokenInfo?.result?.grouping?.length,
          firstGroupingHasGroupKey:
            tokenInfo?.result?.grouping?.[0]?.hasOwnProperty('group_key'),
        },
        null,
        2
      )
    )
  } catch (error) {
    console.error('Error fetching token info:', error)
    return <WalletView address={id} />
  }

  // If no token info found, treat as a wallet
  if (!tokenInfo?.result) {
    console.log('No token info found, showing wallet view')
    return <WalletView address={id} />
  }

  // Determine token type and render appropriate view
  const isFungibleToken = tokenInfo.result.interface === 'FungibleToken'
  const isFungibleAsset = tokenInfo.result.interface === 'FungibleAsset'

  console.log('Token type detection:', {
    interface: tokenInfo.result.interface,
    isFungibleToken,
    isFungibleAsset,
  })

  if (isFungibleToken || isFungibleAsset) {
    console.log('Rendering FungibleTokenDetailsWrapper')
    return (
      <FungibleTokenDetailsWrapper
        id={id}
        tokenInfo={tokenInfo.result as FungibleTokenInfo}
      />
    )
  }

  // Check if it's an NFT collection
  const groupingInfos = tokenInfo.result?.grouping
  if (groupingInfos && groupingInfos.length > 0) {
    const [groupingInfo] = groupingInfos
    if (!groupingInfo?.hasOwnProperty('group_key')) {
      console.log('Rendering NFTCollectionDetail')
      return (
        <NFTCollectionDetail
          id={id}
          tokenInfo={tokenInfo.result as NFTTokenInfo}
        />
      )
    }
  }

  console.log('Rendering NFTDetails')
  return <NFTDetails tokenInfo={tokenInfo.result as NFTTokenInfo} />
}
