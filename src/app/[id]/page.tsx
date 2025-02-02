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
          return {
            title: `${token.content.metadata.name} | Explorer`,
            description:
              token.content.metadata.description ||
              `View details for ${token.content.metadata.name} token on Solana`,
          }
        }
        break

      case 'transaction':
        return {
          title: `Transaction ${cleanId.slice(0, 8)}... | Explorer`,
          description: `View details for Solana transaction ${cleanId}`,
        }

      case 'profile':
        return {
          title: `@${cleanId} | Explorer`,
          description: `Follow @${cleanId} on Explorer to see their activity on Solana`,
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
