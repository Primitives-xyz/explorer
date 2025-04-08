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

export enum FilterTabsYourTransactions {
  ALL = 'All',
  DAY = '24h',
  WEEK = 'Last Week',
  MONTH = 'Last Month',
}

interface Props {
  selectedType: TabsTokenDetails
  sort: FilterTabsTokenDetails | FilterTabsYourTransactions
  setSelectedType: (type: TabsTokenDetails) => void
  setSort: (frame: FilterTabsTokenDetails | FilterTabsYourTransactions) => void
}

export function FilterTokenDetails({
  selectedType,
  sort,
  setSort,
  setSelectedType,
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
      <div className="mb-4">
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
        {selectedType === TabsTokenDetails.YOUR_TRANSACTIONS && (
          <Select
            onValueChange={(value) =>
              setSort(value as FilterTabsYourTransactions)
            }
            value={sort}
          >
            <SelectTrigger className="border-none bg-transparent text-primary h-9">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="border border-primary text-primary">
              <SelectItem value={FilterTabsYourTransactions.ALL}>
                All
              </SelectItem>
              <SelectItem value={FilterTabsYourTransactions.DAY}>
                24h
              </SelectItem>
              <SelectItem value={FilterTabsYourTransactions.WEEK}>
                Last Week
              </SelectItem>
              <SelectItem value={FilterTabsYourTransactions.MONTH}>
                Last Month
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
