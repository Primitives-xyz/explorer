import { ProfileTransactions } from '@/components-new-version/profile/profile-transactions'
import {
  FilterTabs,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectVariant,
  TabVariant,
} from '@/components-new-version/ui'
import { useState } from 'react'

export enum FilterTabsProfileTableInfo {
  TRANSACTIONS = 'transactions',
  ASSETS = 'assets',
}

interface Props {
  walletAddress: string
}

export function ProfileTableInfo({ walletAddress }: Props) {
  const [selected, setSelected] = useState(
    FilterTabsProfileTableInfo.TRANSACTIONS
  )

  const [transactionTypes, setTransactionTypes] = useState<string[]>([])

  const [transactionTypeSelected, setTransactionTypeSelected] =
    useState<string>(transactionTypes[0] || 'all')

  const options = [
    { label: 'Transactions', value: FilterTabsProfileTableInfo.TRANSACTIONS },
    { label: 'Assets', value: FilterTabsProfileTableInfo.ASSETS },
  ]

  return (
    <div>
      <div className="w-full flex items-center justify-between">
        <FilterTabs
          options={options}
          selected={selected}
          onSelect={setSelected}
          variant={TabVariant.SOCIAL}
        />
        <div className="mb-4">
          {selected === FilterTabsProfileTableInfo.TRANSACTIONS && (
            <Select
              value={transactionTypeSelected}
              onValueChange={(value) => setTransactionTypeSelected(value)}
            >
              <SelectTrigger
                className="border-none bg-transparent capitalize"
                variant={SelectVariant.SOCIAL}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type, index) => (
                  <SelectItem key={index} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="h-[400px] overflow-y-auto pb-6">
        {selected === FilterTabsProfileTableInfo.TRANSACTIONS && (
          <ProfileTransactions
            walletAddress={walletAddress}
            setTransactionTypes={setTransactionTypes}
            transactionTypeSelected={transactionTypeSelected}
          />
        )}
        {selected === FilterTabsProfileTableInfo.ASSETS && <p>assets</p>}
      </div>
    </div>
  )
}
