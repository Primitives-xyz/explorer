'use client'

import { IUserStats } from '@/components/tapestry/models/drift.model'
import { Button, ButtonVariant, Spinner } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { formatUsdValue } from '@/utils/utils'

export enum DirectionFilterType {
  LONG = 'long',
  SHORT = 'short',
}

interface Props {
  selectedDirection: DirectionFilterType
  userStats: IUserStats
  statsLoading: boolean
  blur: boolean
  setSelectedDirection: (type: DirectionFilterType) => void
}

const formatLeverage = (leverage: number) => {
  return leverage.toFixed(2) + 'x'
}

export function HeroPerpetual({
  selectedDirection,
  userStats,
  statsLoading,
  blur,
  setSelectedDirection,
}: Props) {
  const formatHealth = (health: number) => {
    return Math.min(100, Math.max(0, health)).toFixed(0) + '%'
  }

  return (
    <>
      <Card className={`${blur ? 'blur-xs' : ''}`}>
        <CardContent className="flex justify-between items-center p-4">
          <div className="flex flex-col">
            <p className="text-xs">Net USD Value</p>
            <div className="flex items-center gap-2">
              <p className="text-primary">
                {formatUsdValue(userStats.netUsdValue)}
              </p>
              {statsLoading && <Spinner size={12} />}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-xs">Acct. Leverage</p>
            <div className="flex items-center gap-2">
              <p className="text-primary">
                {formatLeverage(userStats.leverage)}
              </p>
              {statsLoading && <Spinner size={12} />}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-xs">Health</p>
            <div className="flex items-center gap-2">
              <p className="text-primary">{formatHealth(userStats.health)}</p>
              {statsLoading && <Spinner size={12} />}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="w-full grid grid-cols-2 gap-2">
        <Button
          variant={selectedDirection === DirectionFilterType.LONG ? ButtonVariant.DEFAULT : ButtonVariant.GHOST}
          onClick={() => setSelectedDirection(DirectionFilterType.LONG)}
        >
          Long
        </Button>

        <Button
          variant={selectedDirection === DirectionFilterType.SHORT ? ButtonVariant.DEFAULT : ButtonVariant.GHOST}
          onClick={() => setSelectedDirection(DirectionFilterType.SHORT)}
        >
          Short
        </Button>
      </div>
    </>
  )
}
