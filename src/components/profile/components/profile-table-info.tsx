import {
  FilterTabs,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectVariant,
  TabVariant,
} from '@/components/ui'
import { useState } from 'react'
import { ProfileAssets } from './profile-assets'
import { ProfileTransactions } from './profile-transactions'

export enum FilterTabsProfileTableInfo {
  TRANSACTIONS = 'transactions',
  ASSETS = 'assets',
}

interface Props {
  walletAddress: string
}

export function ProfileTableInfo({ walletAddress }: Props) {
  const [transactionTypes, setTransactionTypes] = useState<string[]>([])
  const [selected, setSelected] = useState(FilterTabsProfileTableInfo.ASSETS)
  const [transactionTypeSelected, setTransactionTypeSelected] =
    useState<string>(transactionTypes[0] || 'all')

  const options = [
    { label: 'Assets', value: FilterTabsProfileTableInfo.ASSETS },
    { label: 'Transactions', value: FilterTabsProfileTableInfo.TRANSACTIONS },
  ]

  return (
    <div>
      <div className="w-full flex items-center justify-between">
        <FilterTabs
          options={options}
          selected={selected}
          onSelect={setSelected}
          variant={TabVariant.SOCIAL}
          // size={ButtonSize.SM}
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
      <div className="pb-6 max-h-[calc(100vh-500px)] overflow-auto">
        {selected === FilterTabsProfileTableInfo.TRANSACTIONS && (
          <ProfileTransactions
            walletAddress={walletAddress}
            setTransactionTypes={setTransactionTypes}
            transactionTypeSelected={transactionTypeSelected}
          />
        )}
        {selected === FilterTabsProfileTableInfo.ASSETS && (
          <ProfileAssets walletAddress={walletAddress} />
        )}
      </div>
    </div>
  )
}
