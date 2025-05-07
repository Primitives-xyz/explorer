'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { StreamContent } from '@/components/stream/stream-content'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { MobileSwapTray } from '@/components/swap/components/mobile-swap-tray'
import { useIsMobile } from '@/utils/use-is-mobile'

export default function Stream() {
  const { isMobile } = useIsMobile()
  return (
    <MainContentWrapper>
      <StreamContent />
      {isMobile ? <MobileSwapTray /> : <SwapTray />}
    </MainContentWrapper>
  )
} 