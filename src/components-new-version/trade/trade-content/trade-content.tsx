'use client'

import { Graph } from '@/components-new-version/trade/trade-content/graph'
import { TokenDetails } from '@/components-new-version/trade/trade-content/token-details'

export function TradeContent() {
  return (
    <div className="w-2/3 space-y-6">
      <Graph />
      <TokenDetails />
    </div>
  )
}
