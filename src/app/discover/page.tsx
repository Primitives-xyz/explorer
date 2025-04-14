import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components/common/right-sidebar-wrapper'
import { DiscoverContent } from '@/components/discover/discover-content'
import { RightSideDiscover } from '@/components/discover/right-side/right-side-discover'
import { SwapTray } from '@/components/swap/components/swap-tray'

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
