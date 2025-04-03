import {
  FilterTabs,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components-new-version/ui'

export enum TabsTokenDetails {
  TOKEN_DETAILS = 'token_details',
  YOUR_TRANSACTIONS = 'your_transactions',
}

export enum FilterTabsTokenDetails {
  ABOUT = 'about',
  TOKEN_HOLDERS = 'token_holders',
  MARKETS = 'markets',
}

interface Props {
  selectedType: TabsTokenDetails
  sort: FilterTabsTokenDetails
  setSelectedType: (type: TabsTokenDetails) => void
  setSort: (frame: FilterTabsTokenDetails) => void
}

export function FilterTokenDetails({
  selectedType,
  setSelectedType,
  sort,
  setSort,
}: Props) {
  const options = [
    { label: 'Token Details', value: TabsTokenDetails.TOKEN_DETAILS },
    { label: 'Transactions', value: TabsTokenDetails.YOUR_TRANSACTIONS },
  ]

  return (
    <div className="flex items-center justify-between w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      <div>
        {selectedType === TabsTokenDetails.TOKEN_DETAILS && (
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as FilterTabsTokenDetails)}
          >
            <SelectTrigger className="border-none bg-transparent text-primary h-9">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="border border-primary text-primary">
              <SelectItem value={FilterTabsTokenDetails.ABOUT}>
                About
              </SelectItem>
              <SelectItem value={FilterTabsTokenDetails.TOKEN_HOLDERS}>
                Token Holders
              </SelectItem>
              <SelectItem value={FilterTabsTokenDetails.MARKETS}>
                Markets
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
