import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components/common/right-sidebar-wrapper'
import { ProfileWithUsername } from '@/components/profile/components/profile-with-username'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { TokenContent } from '@/components/token/token-content'
import TransactionDetails from '@/components/transactions/transaction-view'
import { determineRouteType, RouteType } from '@/utils/entity'

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
        return <TransactionDetails signature={cleanId} />
      case RouteType.TOKEN:
        return <TokenContent id={cleanId} />
      case RouteType.PROFILE:
        return <ProfileWithUsername username={cleanId} />
      default:
        return <p>Unknown route type</p>
    }
  }

  return (
    <>
      <MainContentWrapper>
        <div className="pr-[36px]">{renderContent(routeType, cleanId)}</div>
      </MainContentWrapper>
        <RightSidebarWrapper>
          <SwapTray />
        </RightSidebarWrapper>
    </>
  )
}
