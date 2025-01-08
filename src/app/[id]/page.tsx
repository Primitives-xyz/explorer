import { ProfileContent } from '@/components/profile/profile-content'
import { PublicKey } from '@solana/web3.js'
import PortfolioTabs from '../portfolio/[address]/PortfolioTabs'
import NFTDetails from '@/components/NFTDetails'
import FungibleTokenDetails from '@/components/FungibleTokenDetails'
import TransactionDetails from '@/components/TransactionDetails'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import { Metadata, ResolvingMetadata } from 'next'
import { isValidTransactionSignature } from '@/utils/validation'
import { TokenInfo, FungibleTokenInfo, NFTTokenInfo } from '@/types/Token'
import { ProfileSection } from '@/components/ProfileSection'

// Types
type Params = Promise<{ id: string }>

/**
 * Generates metadata for the page based on the ID parameter
 * If the ID is a token, uses token metadata
 * Otherwise uses default metadata
 */
export async function generateMetadata(
  { params }: { params: Params },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params
  const defaultMetadata = {
    title: `${id} | Explorer`,
    description: `View details for ${id}`,
  }

  try {
    const tokenInfo = await fetchTokenInfo(id)
    if (tokenInfo?.result) {
      const token = tokenInfo.result
      return {
        title: `${token.content.metadata.name} | Explorer`,
        description: token.content.metadata.description,
      }
    }
  } catch (error) {
    console.error('Error fetching token info:', error)
  }

  return defaultMetadata
}

/**
 * Renders a wallet view with portfolio tabs
 */
function WalletView({ address }: { address: string }) {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-mono text-green-500 mb-8">
        Wallet: {address}
      </h1>
      <PortfolioTabs address={address} />
      <ProfileSection walletAddress={address} />
    </div>
  )
}

/**
 * Handles token-related views
 * 1. Fetches token info
 * 2. Determines if it's a fungible token or NFT
 * 3. Falls back to wallet view if token fetch fails
 */
async function TokenView({ id }: { id: string }) {
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
      <FungibleTokenDetails
        id={id}
        tokenInfo={tokenInfo.result as FungibleTokenInfo}
      />
    )
  }

  return <NFTDetails id={id} tokenInfo={tokenInfo.result as NFTTokenInfo} />
}

/**
 * Main page component that handles different types of IDs:
 * 1. Transaction signatures -> TransactionDetails
 * 2. Public keys -> TokenView (which can show token or wallet)
 * 3. Usernames -> ProfileContent
 */
export default async function ProfilePage({ params }: { params: Params }) {
  const { id } = await params

  // Remove @ prefix if present (for usernames)
  const cleanId = id?.startsWith('@') ? id.slice(1) : id

  // Step 1: Check if it's a transaction signature
  if (isValidTransactionSignature(cleanId)) {
    return <TransactionDetails signature={cleanId} />
  }

  // Step 2: Check if it's a public key
  let isPublicKey = false
  try {
    new PublicKey(cleanId)
    isPublicKey = true
  } catch {
    isPublicKey = false
  }

  // Step 3: Route based on ID type
  if (isPublicKey) {
    // Handle as token or wallet
    return <TokenView id={cleanId} />
  } else {
    // Handle as username
    return <ProfileContent username={cleanId} />
  }
}

// Force dynamic rendering to ensure data is always fresh
export const dynamic = 'force-dynamic'
