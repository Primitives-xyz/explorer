'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components/common/right-sidebar-wrapper'
import { DiscoverContent } from '@/components/discover/discover-content'
import { RightSideDiscover } from '@/components/discover/right-side/right-side-discover'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { FullPageSpinner } from '@/components/ui'
import { useIsMobile } from '@/utils/use-is-mobile'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Discover() {
  const { isMobile } = useIsMobile()
  const { push } = useRouter()

  useEffect(() => {
    if (isMobile) {
      push('/trade')
    }
  }, [isMobile, push])

  if (isMobile) {
    return <FullPageSpinner />
  }

  return (
    <>
      <MainContentWrapper>
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
