import { Card, CardContent, CardHeader } from '@/components/ui'
import { CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function TopDetails() {
  const t = useTranslations()
  return (
    <Card>
      <CardHeader>
        <p className="text-lg">{t('trade.staking.benefits_title')}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-primary font-bold">
            {t('trade.staking.fee_sharing')}
          </p>
          <p className="text-sm">
            Earn rewards that dynamically adjust based on platform activity. The
            more you stake, the greater your share of the rewards pool.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-primary font-bold">
            {t('trade.staking.flexible_staking')}
          </p>
          <p className="text-sm">
            Stake to unlock platform benefits and fee discounts. Your rewards
            grow based on your engagement in the ecosystem.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-primary font-bold">How It Works</p>
          <ul className="text-sm space-y-2">
            <li className="flex gap-2 items-center">
              <div>
                <CheckCircle size={14} className="text-primary" />
              </div>
              <span>
                Stake once every 24 hours to increase your position and boost
                your eligibility for rewards
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <div>
                <CheckCircle size={14} className="text-primary" />
              </div>
              <span>
                Rewards adjust based on your participation level and overall
                network activity
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <div>
                <CheckCircle size={14} className="text-primary" />
              </div>
              <span>
                No fixed APY - incentives grow with ecosystem usage and your
                stake amount
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
