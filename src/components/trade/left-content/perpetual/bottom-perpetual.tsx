'use client'

import { IUserStats } from '@/components/tapestry/models/drift.model'
import { Separator, Spinner, Switch } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { formatUsdValue } from '@/utils/utils'
import { ArrowRight } from 'lucide-react'

interface Props {
  liqPriceLoading: boolean
  liquidationPrice: number | null
  userStats: IUserStats
  amount: string
  leverageValue: number
  showConfirmation: boolean
  formatLeverage: (leverage: number) => string
  setShowConfirmation: (value: boolean) => void
}

export function BottomPerpetual({
  liqPriceLoading,
  liquidationPrice,
  userStats,
  amount,
  leverageValue,
  showConfirmation,
  formatLeverage,
  setShowConfirmation,
}: Props) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-primary text-sm">
          <p>Dynamic Slippage</p>
          <p>Fee 0.00%</p>
        </div>

        <Separator />

        <div className="flex justify-between items-center text-sm">
          <p>Est.Liquidation Price</p>
          <div className="flex items-center gap-2">
            {liqPriceLoading ? (
              <Spinner size={16} />
            ) : liquidationPrice ? (
              formatUsdValue(liquidationPrice)
            ) : (
              'None'
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <p>Acct. Leverage</p>
          <p className="flex items-center gap-2">
            {formatLeverage(userStats.leverage)} <ArrowRight size={14} />
            {formatLeverage(
              userStats.leverage + (Number(amount) > 0 ? leverageValue : 0)
            )}
          </p>
        </div>

        <div className="flex justify-between items-center text-sm">
          <p>Fees</p>
          <p>$0.25</p>
        </div>

        <div className="flex justify-between items-center text-sm">
          <p>Show Confirmation</p>
          <Switch
            checked={showConfirmation}
            onCheckedChange={setShowConfirmation}
          />
        </div>
      </CardContent>
    </Card>
  )
}
