import { ProfileContent } from '@/components/profile/profile-content'
import { PublicKey } from '@solana/web3.js'
import PortfolioTabs from '../portfolio/[address]/PortfolioTabs'
import NFTDetails from '@/components/NFTDetails'
import FungibleTokenDetails from '@/components/FungibleTokenDetails'
import TransactionDetails from '@/components/TransactionDetails'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import { Metadata, ResolvingMetadata } from 'next'
import { isValidTransactionSignature } from '@/utils/validation'

type Params = Promise<{ id: string }>
export async function generateMetadata(
  { params }: { params: Params },
  parent: ResolvingMetadata,
) {
  const { id } = await params

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

  return {
    title: `${id} | Explorer`,
    description: `View details for ${id}`,
  }
}

export default async function ProfilePage({ params }: { params: Params }) {
  const { id } = await params

  // Clean up the id - remove @ symbol if present
  const cleanId = id?.startsWith('@') ? id.slice(1) : id

  // First check if it's a transaction signature
  if (isValidTransactionSignature(cleanId)) {
    return <TransactionDetails signature={cleanId} />
  }

  // Then check if it's a public key
  let isPublicKey = false
  let publicKey: PublicKey | null = null

  try {
    publicKey = new PublicKey(cleanId)
    isPublicKey = true
  } catch (error) {
    isPublicKey = false
  }

  if (!isPublicKey) {
    return <ProfileContent username={cleanId} />
  }

  // Check if this public key is a token
  try {
    const tokenInfo = await fetchTokenInfo(cleanId)

    if (tokenInfo?.result) {
      // Check if it's a fungible token or NFT
      if (
        tokenInfo.result.interface === 'FungibleToken' ||
        tokenInfo.result.interface === 'FungibleAsset'
      ) {
        return (
          <FungibleTokenDetails id={cleanId} tokenInfo={tokenInfo.result} />
        )
      }
      return <NFTDetails id={cleanId} tokenInfo={tokenInfo.result} />
    }
  } catch (error) {
    console.error('Error fetching token info:', error)
  }

  // If token fetch fails or it's not a token, render wallet view
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-mono text-green-500 mb-8">
        Wallet: {cleanId}
      </h1>
      <PortfolioTabs address={cleanId} />
    </div>
  )
}

export const dynamic = 'force-dynamic'
