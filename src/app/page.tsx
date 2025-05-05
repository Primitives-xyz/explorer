'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components/common/right-sidebar-wrapper'
import { HomeContent } from '@/components/home/home-content/home-content'
import { SwapTray } from '@/components/swap/components/swap-tray'

export default function Home() {
  return (
    <>
      <MainContentWrapper className="md:min-w-main-content md:max-w-main-content mx-auto flex justify-center">
        <HomeContent />
      </MainContentWrapper>
      <RightSidebarWrapper>
        <SwapTray isAlwaysOpen />
      </RightSidebarWrapper>
    </>
  )
}
