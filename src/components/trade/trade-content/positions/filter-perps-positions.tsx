import {
  FilterTabs,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

export enum Tabs {
  PERPS_POSITIONS = 'perps_positions',
}

export enum FilterTabsPerpsPositions {
  POSITIONS = 'Positions',
  ORDERS = 'Orders',
}

interface Props {
  selectedType: Tabs
  sort: FilterTabsPerpsPositions
  setSelectedType: (type: Tabs) => void
  setSort: (frame: FilterTabsPerpsPositions) => void
}

export function FilterPerpsPositions({
  selectedType,
  sort,
  setSort,
  setSelectedType,
}: Props) {
  const options = [
    { label: 'Perps Positions', value: Tabs.PERPS_POSITIONS },
  ]

  return (
    <div className="flex items-center justify-between w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      <div className="mb-4">
        <Select
          value={sort}
          onValueChange={(value) => setSort(value as FilterTabsPerpsPositions)}
        >
          <SelectTrigger className="border-none bg-transparent text-primary h-9">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent className="border border-primary text-primary">
            <SelectItem value={FilterTabsPerpsPositions.POSITIONS}>
              {FilterTabsPerpsPositions.POSITIONS}
            </SelectItem>
            <SelectItem value={FilterTabsPerpsPositions.ORDERS}>
              {FilterTabsPerpsPositions.ORDERS}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
