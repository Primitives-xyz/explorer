import type { FungibleTokenInfo, NFTTokenInfo } from '@/types/Token'

import type { TokenInfo } from '@/types/Token'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import NFTDetails from '../NFT-details'
import { WalletView } from '../wallet/wallet-view'
import { FungibleTokenDetailsWrapper } from './FungibleTokenDetailsWrapper'

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

  // Determine token type and render appropriate view
  const isFungibleToken = tokenInfo.result.interface === 'FungibleToken'
  const isFungibleAsset = tokenInfo.result.interface === 'FungibleAsset'

  if (isFungibleToken || isFungibleAsset) {
    return (
      <FungibleTokenDetailsWrapper
        id={id}
        tokenInfo={tokenInfo.result as FungibleTokenInfo}
      />
    )
  }

  return <NFTDetails id={id} tokenInfo={tokenInfo.result as NFTTokenInfo} />
}
