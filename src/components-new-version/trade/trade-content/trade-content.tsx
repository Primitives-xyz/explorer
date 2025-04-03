'use client'

import { Graph } from '@/components-new-version/trade/trade-content/graph'
import { TokenDetails } from '@/components-new-version/trade/trade-content/token-details/token-details'

interface TradeContentProps {
  id: string
}

export function TradeContent({ id }: TradeContentProps) {
  return (
    <div className="w-2/3 space-y-6 mt-[52px]">
      <Graph id={id} />
      <TokenDetails id={id} />
    </div>
  )
}
