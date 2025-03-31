import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { TradeLeftContent } from '@/components-new-version/trade/left-content/trade-left-content'
import { TradeContent } from '@/components-new-version/trade/trade-content/trade-content'

export default function Page() {
  return (
    <OverflowContentWrapper className="flex gap-6">
      <TradeLeftContent />
      <TradeContent />
    </OverflowContentWrapper>
  )
}
