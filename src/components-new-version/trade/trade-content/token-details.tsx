import { FilterTabs } from '@/components-new-version/common/filter-tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'
import { useState } from 'react'

export enum FilterType {
  TOKEN_DETAILS = 'token_details',
  YOUR_TRANSACTIONS = 'your_transactions',
}

export function TokenDetails() {
  const [selectedType, setSelectedType] = useState(FilterType.TOKEN_DETAILS)

  const options = [
    { label: 'Token Details', value: FilterType.TOKEN_DETAILS },
    { label: 'Transactions', value: FilterType.YOUR_TRANSACTIONS },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FilterTabs
            options={options}
            selected={selectedType}
            onSelect={setSelectedType}
          />
        </CardTitle>
        <CardContent>
          {selectedType === FilterType.TOKEN_DETAILS && <p>token details</p>}
          {selectedType === FilterType.YOUR_TRANSACTIONS && <p>transactions</p>}
        </CardContent>
      </CardHeader>
    </Card>
  )
}
