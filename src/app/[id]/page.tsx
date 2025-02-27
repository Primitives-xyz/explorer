import { ProfileView } from '@/components/profile/profile-view'
import { TokenView } from '@/components/tokens/token-view'
import TransactionDetails from '@/components/transactions/transaction-view'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import {
  generateProfileMetadata,
  generateTokenMetadata,
  generateTransactionMetadata,
  resolveTokenImage,
} from '@/utils/metadata'
import {
  determineRouteType,
  type IdParams as Params,
  type RouteType,
} from '@/utils/validation'
import type { Metadata } from 'next'

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
  console.log('routeType', routeType)
  // Default metadata as fallback
  const defaultMetadata: Metadata = {
    title: `${id} | Explorer`,
    description: `View details for ${id}`,
  }

  try {
    switch (routeType) {
      case 'token':
        const tokenInfo = await fetchTokenInfo(id)
        if (tokenInfo?.result) {
          const imageUrl = resolveTokenImage(tokenInfo.result)
          const collection = tokenInfo.result.grouping?.find(
            (g: { group_key: string; group_value: string }) =>
              g.group_key === 'collection'
          )
          return generateTokenMetadata({
            token: tokenInfo.result,
            imageUrl,
            collection,
          })
        }
        break

      case 'transaction':
        return generateTransactionMetadata(cleanId)

      case 'profile':
        return await generateProfileMetadata(cleanId)
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
      return <ProfileView username={cleanId} />
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
