import { ProfileContent } from '@/components/profile/profile-content'
import { PublicKey } from '@solana/web3.js'
import PortfolioTabs from '../portfolio/[address]/PortfolioTabs'
import NFTDetails from '@/components/NFTDetails'
import FungibleTokenDetails from '@/components/FungibleTokenDetails'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = params

  try {
    const tokenInfo = await fetchTokenInfo(id)
    if (tokenInfo?.result) {
      const { result } = tokenInfo
      const title = result.content?.metadata?.name || id
      const description =
        result.content?.metadata?.description ||
        `Details for ${result.interface} ${id}`
      const imageUrl =
        result.content?.links?.image || result.content?.files?.[0]?.uri

      // Optionally access and extend parent metadata
      const previousImages = (await parent).openGraph?.images || []

      return {
        title: `${title} | Explorer`,
        description,
        openGraph: {
          title: `${title} | Explorer`,
          description,
          images: imageUrl ? [imageUrl, ...previousImages] : previousImages,
        },
        twitter: {
          card: 'summary_large_image',
          title: `${title} | Explorer`,
          description,
          images: imageUrl ? [imageUrl] : [],
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  // Default metadata if token info not available
  return {
    title: `${id} | Explorer`,
    description: `Explore details for ${id}`,
    openGraph: {
      title: `${id} | Explorer`,
      description: `Explore details for ${id}`,
    },
    twitter: {
      card: 'summary',
      title: `${id} | Explorer`,
      description: `Explore details for ${id}`,
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const { id } = params

  let isPublicKey = false
  let publicKey: PublicKey | null = null

  try {
    publicKey = new PublicKey(id)
    isPublicKey = true
  } catch (error) {
    isPublicKey = false
  }

  if (!isPublicKey) {
    return <ProfileContent username={id} />
  }

  // Check if this public key is a token
  const tokenInfo = await fetchTokenInfo(id)

  if (tokenInfo) {
    // Check if it's a fungible token or NFT
    if (
      tokenInfo.result.interface === 'FungibleToken' ||
      tokenInfo.result.interface === 'FungibleAsset'
    ) {
      return <FungibleTokenDetails id={id} tokenInfo={tokenInfo.result} />
    }
    return <NFTDetails id={id} tokenInfo={tokenInfo.result} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-mono text-green-500 mb-8">Wallet: {id}</h1>
      <PortfolioTabs address={id} />
    </div>
  )
}

export const dynamic = 'force-dynamic'
