import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { ProfileContent } from '@/components-new-version/profile/profile-content'
import { TokenContent } from '@/components-new-version/token/token-content'
import {
  isValidPublicKey,
  isValidTransactionSignature,
} from '@/components-new-version/utils/validation'

export enum RouteType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  PROFILE = 'profile',
}

function renderContent(routeType: RouteType, cleanId: string) {
  switch (routeType) {
    case RouteType.TRANSACTION:
      return <p>transaction page</p>
    case RouteType.TOKEN:
      return <TokenContent id={cleanId} />
    case RouteType.PROFILE:
      return <ProfileContent username={cleanId} />
    default:
      return <p>Unknown route type</p>
  }
}

export default async function Entity({ params }: { params: { id: string } }) {
  const { id } = params

  const cleanId = id.startsWith('@') ? id.slice(1) : id
  const routeType = determineRouteType(id)

  return (
    <MainContentWrapper>{renderContent(routeType, cleanId)}</MainContentWrapper>
  )
}

export function determineRouteType(id: string): RouteType {
  const cleanId = id.startsWith('@') ? id.slice(1) : id

  if (isValidTransactionSignature(cleanId)) {
    return RouteType.TRANSACTION
  }

  if (isValidPublicKey(cleanId)) {
    return RouteType.TOKEN
  }

  return RouteType.PROFILE
}
