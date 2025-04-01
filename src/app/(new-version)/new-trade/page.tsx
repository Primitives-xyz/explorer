import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { TradeLeftContent } from '@/components-new-version/trade/left-content/trade-left-content'
import { TradeContent } from '@/components-new-version/trade/trade-content/trade-content'

export default function Page() {
  return (
    <MainContentWrapper className="flex gap-6">
      <TradeLeftContent />
      <TradeContent />
    </MainContentWrapper>
  )
}
