'use client'

import { Graph } from '@/components/trade/trade-content/graph'
import { TokenDetails } from '@/components/trade/trade-content/token-details/token-details'
import { FilterType } from '../left-content/trade-left-content'
import { PerpsPositions } from './positions/perps-positions'

interface TradeContentProps {
  id: string
  selectedType: FilterType
}

export function TradeContent({ id, selectedType }: TradeContentProps) {
  return (
    <div className="w-full md:w-2/3 space-y-6 md:mt-[52px]">
      <Graph id={id} />
      {selectedType === FilterType.SWAP && <TokenDetails id={id} />}
      {selectedType === FilterType.PERPETUAL && <PerpsPositions />}
    </div>
  )
}
