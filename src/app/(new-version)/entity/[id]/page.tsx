import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { ProfileContent } from '@/components-new-version/profile/components/profile-content'
import { TokenContent } from '@/components-new-version/token/token-content'
import {
  determineRouteType,
  RouteType,
} from '@/components-new-version/utils/entity'

export default async function Entity({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cleanId = id.startsWith('@') ? id.slice(1) : id
  const routeType = determineRouteType(id)

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

  return (
    <MainContentWrapper>{renderContent(routeType, cleanId)}</MainContentWrapper>
  )
}
