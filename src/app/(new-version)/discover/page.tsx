import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components-new-version/common/right-sidebar-wrapper'
import { DiscoverContent } from '@/components-new-version/discover/discover-content'
import { RightSideDiscover } from '@/components-new-version/discover/right-side/right-side-discover'
import { SwapTray } from '@/components-new-version/swap/components/swap-tray'

export default function Discover() {
  return (
    <>
      <MainContentWrapper>
        <DiscoverContent />
      </MainContentWrapper>
      <RightSidebarWrapper className="pt-[52px]">
        <div className="pr-[36px]">
          <RightSideDiscover />
          <SwapTray />
        </div>
      </RightSidebarWrapper>
    </>
  )
}
