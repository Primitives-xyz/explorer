import { ProfileContent } from '@/components/profile/profile-content'
import TransactionDetails from '@/components/transactions/transaction-view'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import type { Metadata } from 'next'
import {
  determineRouteType,
  type RouteType,
  type IdParams as Params,
} from '@/utils/validation'
import { TokenView } from '@/components/tokens/token-view'
import {
  generateTokenMetadata,
  generateTransactionMetadata,
  generateProfileMetadata,
  resolveTokenImage,
} from '@/utils/metadata'

/**
 * Generates metadata for the page based on the ID parameter
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
  const defaultMetadata: Metadata = {
    title: `${id} | Explorer`,
    description: `View details for ${id}`,
    openGraph: {
      type: 'website',
      title: `${id} | Explorer`,
      description: `View details for ${id}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(String(id))}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${id} | Explorer`,
      description: `View details for ${id}`,
      images: `/api/og?title=${encodeURIComponent(String(id))}`,
    },
  }

  try {
    switch (routeType) {
      case 'token': {
        const tokenInfo = await fetchTokenInfo(id)
        if (tokenInfo?.result) {
          const imageUrl = resolveTokenImage(tokenInfo.result)
          const collection = tokenInfo.result.grouping?.find(
            (g: { group_key: string; group_value: string }) =>
              g.group_key === 'collection',
          )
          const metadata = generateTokenMetadata({
            token: tokenInfo.result,
            imageUrl,
            collection,
          })

          const ogImageUrl = `/api/og?title=${encodeURIComponent(
            String(metadata.title),
          )}&description=${encodeURIComponent(
            String(metadata.description),
          )}&image=${encodeURIComponent(String(imageUrl))}`

          return {
            ...metadata,
            openGraph: {
              type: 'website',
              title: metadata.title || '',
              description: metadata.description || '',
              images: [
                {
                  url: ogImageUrl,
                },
              ],
            },
            twitter: {
              card: 'summary_large_image',
              title: metadata.title || '',
              description: metadata.description || '',
              images: ogImageUrl,
            },
          }
        }
        break
      }

      case 'transaction':
        return generateTransactionMetadata(cleanId)

      case 'profile': {
        const profileMetadata = await generateProfileMetadata(cleanId)
        if (profileMetadata) {
          return profileMetadata
        }
        break
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
