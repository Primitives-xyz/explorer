'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { StatusBar } from '@/components/status-bar/status-bar'
import { StonksContent } from '@/components/stonks/stonks-content'
import { MobileSwapTray } from '@/components/swap/components/mobile-swap-tray'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { useIsMobile } from '@/utils/use-is-mobile'

export default function Stonks() {
  const { isMobile } = useIsMobile()

  return (
    <MainContentWrapper>
      <StatusBar condensed={false} />
      <StonksContent />
      {isMobile ? <MobileSwapTray /> : <SwapTray />}
    </MainContentWrapper>
  )
}
