import { FilterTabs } from '@/components/ui'

export enum Tabs {
  PERPS_POSITIONS = 'Positions',
  PERPS_ORDERS = 'Orders',
}

export enum FilterTabsPerpsPositions {
  POSITIONS = 'Positions',
  ORDERS = 'Orders',
}

interface Props {
  selectedType: Tabs
  setSelectedType: (type: Tabs) => void
}

export function FilterPerpsPositions({ selectedType, setSelectedType }: Props) {
  const options = [
    { label: 'Positions', value: Tabs.PERPS_POSITIONS },
    { label: 'Orders', value: Tabs.PERPS_ORDERS },
  ]

  return (
    <div className="flex items-center justify-between w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
    </div>
  )
}
