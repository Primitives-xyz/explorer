'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { SignalsContent } from '@/components/signals/signals-content'
import { MobileSwapTray } from '@/components/swap/components/mobile-swap-tray'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { useIsMobile } from '@/utils/use-is-mobile'

export default function SignalsPage() {
  const { isMobile } = useIsMobile()

  return (
    <MainContentWrapper className="max-w-full md:max-w-6xl">
      <SignalsContent />
      {isMobile ? <MobileSwapTray /> : <SwapTray />}
    </MainContentWrapper>
  )
}
