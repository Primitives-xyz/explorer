import { Swap } from '@/components/swap/components/swap'
import { FilterTabs } from '@/components/ui'
import { useTrade } from '../context/trade-context'
import { Perpetual } from './perpetual/updated-perpetual'

export enum FilterType {
  SWAP = 'swap',
  PERPS = 'perps',
}

export function TradeLeftContent() {
  const { selectedType, setSelectedType } = useTrade()

  const options = [
    { label: 'Swap', value: FilterType.SWAP },
    { label: 'Perpetual', value: FilterType.PERPS },
  ]

  return (
    <div className="w-full md:w-1/3">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
        buttonClassName="flex-1 md:flex-none"
      />
      {selectedType === FilterType.SWAP && <Swap />}
      {selectedType === FilterType.PERPS && <Perpetual />}
    </div>
  )
}
