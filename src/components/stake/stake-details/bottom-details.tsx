import { Card, CardContent, CardHeader } from '@/components/ui'
import { CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function BottomDetails() {
  const t = useTranslations()
  return (
    <Card>
      <CardHeader>
        <p className="text-lg">{t('trade.staking.tiers_title')}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <StakingTierCard
            emoji="🥇"
            title={t('trade.staking.gold_tier')}
            requirement={t('trade.staking.gold_requirement')}
            benefits={[
              `50% ${t('trade.staking.swap_fee_discount').substring(1)}`,
              `60% ${t('trade.staking.comment_fee_discount').substring(1)}`,
            ]}
          />
        </div>
        <div className="flex items-center justify-center gap-6">
          <StakingTierCard
            emoji="🥈"
            title={t('trade.staking.silver_tier')}
            requirement={t('trade.staking.silver_requirement')}
            benefits={[
              `25% ${t('trade.staking.swap_fee_discount').substring(1)}`,
              `40% ${t('trade.staking.comment_fee_discount').substring(1)}`,
            ]}
          />
          <StakingTierCard
            emoji="🥉"
            title={t('trade.staking.bronze_tier')}
            requirement={t('trade.staking.bronze_requirement')}
            benefits={[
              `10% ${t('trade.staking.swap_fee_discount').substring(1)}`,
              `30% ${t('trade.staking.comment_fee_discount').substring(1)}`,
            ]}
          />
        </div>
        <div className="my-4 text-xs text-muted-foreground italic text-center">
          {t('trade.staking.disclaimer')}
        </div>
      </CardContent>
    </Card>
  )
}

interface StakingTierCardProps {
  emoji: string
  title: string
  requirement: string
  benefits: string[]
  className?: string
}

export function StakingTierCard({
  emoji,
  title,
  requirement,
  benefits,
}: StakingTierCardProps) {
  return (
    <Card className="bg-card-accent">
      <CardHeader className="flex flex-col items-center justify-center">
        <p className="text-primary font-bold">
          {emoji} {title}
        </p>
        <p>{requirement}</p>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-2">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex gap-2 items-center">
              <div>
                <CheckCircle size={12} className="text-primary" />
              </div>

              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
