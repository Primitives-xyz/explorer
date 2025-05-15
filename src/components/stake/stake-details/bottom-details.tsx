import { Card, CardContent, CardHeader } from '@/components/ui'
import { CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function BottomDetails() {
  const t = useTranslations('stake')
  return (
    <Card>
      <CardHeader>
        <p className="text-lg">{t('details.tiers.title')}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <StakingTierCard
            emoji="🥇"
            title={t('details.tiers.gold.title')}
            requirement={t('details.tiers.gold.requirement')}
            benefits={[
              t('details.tiers.gold.benefits.swap_fee'),
              t('details.tiers.gold.benefits.comment_fee'),
            ]}
          />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <StakingTierCard
            emoji="🥈"
            title={t('details.tiers.silver.title')}
            requirement={t('details.tiers.silver.requirement')}
            benefits={[
              t('details.tiers.silver.benefits.swap_fee'),
              t('details.tiers.silver.benefits.comment_fee'),
            ]}
          />
          <StakingTierCard
            emoji="🥉"
            title={t('details.tiers.bronze.title')}
            requirement={t('details.tiers.bronze.requirement')}
            benefits={[
              t('details.tiers.bronze.benefits.swap_fee'),
              t('details.tiers.bronze.benefits.comment_fee'),
            ]}
          />
        </div>
        <div className="my-4 text-xs text-muted-foreground italic text-center">
          {t('details.tiers.disclaimer')}
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
