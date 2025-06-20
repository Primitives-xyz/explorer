'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components/common/right-sidebar-wrapper'
import { DiscoverContent } from '@/components/discover/discover-content'
import { RightSideDiscover } from '@/components/discover/right-side/right-side-discover'
import { StatusBar } from '@/components/status-bar/status-bar'
import { SwapTray } from '@/components/swap/components/swap-tray'

export default function Discover() {
  return (
    <>
      <MainContentWrapper>
        <StatusBar condensed />
        <DiscoverContent />
      </MainContentWrapper>
      <RightSidebarWrapper className="pt-[52px] relative z-20">
        <div className="pr-[36px]">
          <RightSideDiscover />
          <SwapTray />
        </div>
      </RightSidebarWrapper>
    </>
  )
}
