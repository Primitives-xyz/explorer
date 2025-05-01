import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { StreamContent } from '@/components/stream/stream-content'
import { SwapTray } from '@/components/swap/components/swap-tray'
export default function Stream() {
  return (
    <MainContentWrapper>
      <StreamContent />
      <SwapTray />
    </MainContentWrapper>
    
  )
} 