'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components/common/right-sidebar-wrapper'
import { HomeContent } from '@/components/home/home-content/home-content'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { route } from '@/utils/route'
import { useIsMobile } from '@/utils/use-is-mobile'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { isMobile } = useIsMobile()
  const router = useRouter()

  useEffect(() => {
    if (isMobile) {
      const hasVisitedBefore = localStorage.getItem('hasVisitedBefore')
      if (!hasVisitedBefore) {
        localStorage.setItem('hasVisitedBefore', 'true')
        router.push(route('trade'))
      }
    }
  }, [isMobile, router])

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
