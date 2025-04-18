'use client'

import { IUserStats } from '@/components/tapestry/models/drift.model'
import { FilterTabs } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { formatUsdValue } from '@/utils/utils'

export enum DirectionFilterType {
  LONG = 'long',
  SHORT = 'short',
}

interface Props {
  selectedDirection: DirectionFilterType
  userStats: IUserStats
  setSelectedDirection: (type: DirectionFilterType) => void
  formatLeverage: (leverage: number) => string
}

export function HeroPerpetual({
  selectedDirection,
  userStats,
  setSelectedDirection,
  formatLeverage,
}: Props) {
  const options = [
    { label: 'Long', value: DirectionFilterType.LONG },
    { label: 'Short', value: DirectionFilterType.SHORT },
  ]

  const formatHealth = (health: number) => {
    return Math.min(100, Math.max(0, health)).toFixed(0) + '%'
  }

  return (
    <>
      <Card>
        <CardContent className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-xs">Net USD Value</p>
            <p>{formatUsdValue(userStats.netUsdValue)}</p>
          </div>

          <div className="flex flex-col">
            <p className="text-xs">Acct. Leverage</p>
            <p>{formatLeverage(userStats.leverage)}</p>
          </div>

          <div className="flex flex-col">
            <p className="text-xs">Health</p>
            <p className="text-primary">{formatHealth(userStats.health)}</p>
          </div>
        </CardContent>
      </Card>

      <FilterTabs
        className="flex items-center justify-between"
        buttonClassName="w-1/2"
        options={options}
        selected={selectedDirection}
        onSelect={setSelectedDirection}
      />
    </>
  )
}
