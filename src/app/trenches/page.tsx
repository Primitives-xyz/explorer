'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { MobileSwapTray } from '@/components/swap/components/mobile-swap-tray'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { TrenchesContent } from '@/components/trenches/trenches-content'
import { useIsMobile } from '@/utils/use-is-mobile'

export default function Trenches() {
  const { isMobile } = useIsMobile()
  return (
    <MainContentWrapper>
      <TrenchesContent />
      {isMobile ? <MobileSwapTray /> : <SwapTray />}
    </MainContentWrapper>
  )
}
