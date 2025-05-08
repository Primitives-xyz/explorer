'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { StreamContent } from '@/components/stream/stream-content'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { MobileSwapTray } from '@/components/swap/components/mobile-swap-tray'
import { useIsMobile } from '@/utils/use-is-mobile'
import { TrenchesContent } from '@/components/trenches/trenches-content'

export default function Trenches() {
  const { isMobile } = useIsMobile()
  return (
    <MainContentWrapper>
      <TrenchesContent />
      {isMobile ? <MobileSwapTray /> : <SwapTray />}
    </MainContentWrapper>
  )
} 