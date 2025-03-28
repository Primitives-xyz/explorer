import { SimpleContentWrapper } from '@/components-new-version/common/simple-content-wrapper'
import { TradeLeftContent } from '@/components-new-version/trade/left-content/trade-left-content'
import { TradeContent } from '@/components-new-version/trade/trade-content/trade-content'

export default function Page() {
  return (
    <SimpleContentWrapper>
      <div className="w-full flex space-x-6">
        <TradeLeftContent />
        <TradeContent />
      </div>
    </SimpleContentWrapper>
  )
}
