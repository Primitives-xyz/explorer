import { ProfileContent } from '@/components/profile/profile-content'
import TransactionDetails from '@/components/transactions/transaction-view'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import { Metadata } from 'next'
import {
  determineRouteType,
  RouteType,
  IdParams as Params,
} from '@/utils/validation'
import { TokenView } from '@/components/tokens/token-view'

/**
/**
 * Generates metadata for the page based on the ID parameter
 * If the ID is a token, uses token metadata
 * Otherwise uses default metadata
 */
export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { id } = await params
  const cleanId = id?.startsWith('@') ? id.slice(1) : id
  const routeType = determineRouteType(id)

  // Default metadata as fallback
  const defaultMetadata = {
    title: `${id} | Explorer`,
    description: `View details for ${id}`,
  }

  try {
    switch (routeType) {
      case 'token':
        const tokenInfo = await fetchTokenInfo(id)
        if (tokenInfo?.result) {
          const token = tokenInfo.result
          const isNFT =
            token.interface === 'V1_NFT' ||
            token.interface === 'V2_NFT' ||
            token.interface === 'LEGACY_NFT' ||
            token.interface === 'ProgrammableNFT'

          // Resolve image URL using the same logic as useNFTImage hook
          const imageUrl =
            token.content?.links?.image ||
            token.content?.files?.[0]?.cdn_uri ||
            token.content?.files?.[0]?.uri ||
            token.content?.metadata?.image

          // Get collection info if available
          const collection = token.grouping?.find(
            (g: { group_key: string; group_value: string }) =>
              g.group_key === 'collection',
          )
          const collectionName = collection
            ? ` from ${collection.group_value}`
            : ''

          // Build description with more context
          const description =
            token.content.metadata.description ||
            `View details for ${token.content.metadata.name}${collectionName} ${
              isNFT ? 'NFT' : 'token'
            } on Solana`

          return {
            title: `${token.content.metadata.name} | Explorer`,
            description,
            openGraph: {
              title: `${token.content.metadata.name} ${
                isNFT ? 'NFT' : 'Token'
              } | Explorer`,
              description,
              ...(imageUrl && {
                images: [
                  {
                    url: imageUrl,
                    width: 1200,
                    height: 1200,
                    alt: token.content.metadata.name,
                  },
                ],
              }),
              type: isNFT ? 'article' : 'website',
              siteName: 'Explorer',
            },
            twitter: {
              card: imageUrl ? 'summary_large_image' : 'summary',
              title: `${token.content.metadata.name} ${
                isNFT ? 'NFT' : 'Token'
              } | Explorer`,
              description,
              ...(imageUrl && {
                images: [imageUrl],
              }),
              creator: '@explorer',
            },
            ...(imageUrl && {
              icons: {
                icon: imageUrl,
                shortcut: imageUrl,
                apple: imageUrl,
              },
            }),
          }
        }
        break

      case 'transaction':
        return {
          title: `Transaction ${cleanId.slice(0, 8)}... | Explorer`,
          description: `View details for Solana transaction ${cleanId}`,
          openGraph: {
            title: `Transaction ${cleanId.slice(0, 8)}... | Explorer`,
            description: `View details for Solana transaction ${cleanId}`,
            type: 'article',
            siteName: 'Explorer',
          },
          twitter: {
            card: 'summary',
            title: `Transaction ${cleanId.slice(0, 8)}... | Explorer`,
            description: `View details for Solana transaction ${cleanId}`,
            creator: '@explorer',
          },
        }

      case 'profile':
        const title = `@${cleanId} | Explorer`
        const description = `Follow @${cleanId} on Explorer to see their activity on Solana`

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: 'website',
            siteName: 'Explorer',
          },
          twitter: {
            card: 'summary',
            title,
            description,
            creator: '@explorer',
            site: '@explorer',
          },
        }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return defaultMetadata
}

/**
 * Renders the appropriate component based on the route type
 */
function renderContent(routeType: RouteType, cleanId: string) {
  switch (routeType) {
    case 'transaction':
      return <TransactionDetails signature={cleanId} />
    case 'token':
      return <TokenView id={cleanId} />
    case 'profile':
      return <ProfileContent username={cleanId} />
  }
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params
  const cleanId = id?.startsWith('@') ? id.slice(1) : id
  const routeType = determineRouteType(id)

  return renderContent(routeType, cleanId)
}

// Force dynamic rendering to ensure data is always fresh
export const dynamic = 'force-dynamic'
