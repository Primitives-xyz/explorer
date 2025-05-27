'use client'

import { Graph } from '@/components/trade/trade-content/graph'
import { TokenDetails } from '@/components/trade/trade-content/token-details/token-details'
import { useIsMobile } from '@/utils/use-is-mobile'
import { cn } from '@/utils/utils'
import { PerpsType, useTrade } from '../context/trade-context'
import { FilterType } from '../left-content/trade-left-content'
import { PerpsPositions } from './positions/drift/perps-positions'
import { JupPerpsPositions } from './positions/jupiter/jup-perps-positions'

export function TradeContent() {
  const { tokenMint, selectedType, selectedPerpsType } = useTrade()
  const { isMobile } = useIsMobile()

  return (
    <div
      className={cn('w-full md:w-2/3 space-y-6', !isMobile && 'md:mt-[52px]')}
    >
      <Graph id={tokenMint} />
      {selectedType === FilterType.SWAP && <TokenDetails id={tokenMint} />}
      {selectedType === FilterType.PERPS &&
        selectedPerpsType === PerpsType.DRIFT && <PerpsPositions />}
      {selectedType === FilterType.PERPS &&
        selectedPerpsType === PerpsType.JUPITER && <JupPerpsPositions />}
    </div>
  )
}
