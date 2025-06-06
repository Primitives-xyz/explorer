'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components/common/right-sidebar-wrapper'
import { HomeContent } from '@/components/home/home-content/home-content'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { useIsMobile } from '@/utils/use-is-mobile'
import { route } from '@/utils/route'

export default function Home() {
  const { isMobile } = useIsMobile()
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Only redirect mobile users on their first visit to the homepage
    // Check if this is the first time visiting the homepage in this session
    const hasVisitedHomepage = sessionStorage.getItem('visited-homepage')
    
    if (isMobile && !hasVisitedHomepage && !hasRedirected.current) {
      hasRedirected.current = true
      sessionStorage.setItem('visited-homepage', 'true')
      router.replace(route('trade'))
    } else if (!hasVisitedHomepage) {
      // Mark homepage as visited for non-mobile users too
      sessionStorage.setItem('visited-homepage', 'true')
    }
  }, [isMobile, router])

  // Render homepage content for both desktop and mobile users
  // Mobile users can now access homepage after initial redirect or by direct navigation
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
