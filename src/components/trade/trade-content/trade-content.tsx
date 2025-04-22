'use client'

import { Graph } from '@/components/trade/trade-content/graph'
import { TokenDetails } from '@/components/trade/trade-content/token-details/token-details'
import { PerpsPositions } from './positions/perps-positions'
import { FilterType } from '../left-content/trade-left-content'

interface TradeContentProps {
  id: string
  selectedType: FilterType
}

export function TradeContent({ id, selectedType }: TradeContentProps) {
  return (
    <div className="w-2/3 space-y-6 mt-[52px]">
      <Graph id={id} />
      {
        selectedType === FilterType.SWAP && <TokenDetails id={id} />
      }

      {
        selectedType === FilterType.PERPETUAL && <PerpsPositions />
      }
    </div>
  )
}
