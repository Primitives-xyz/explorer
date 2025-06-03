import { Card, CardContent, CardHeader } from '@/components/ui'
import { CheckCircle, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function BottomDetails() {
  const t = useTranslations('stake')
  return (
    <Card className="h-full border-0 shadow-md bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Trophy className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-30" />
          </div>
          <p className="text-lg font-semibold">{t('details.tiers.title')}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-3">
          <StakingTierCard
            emoji="🥇"
            title={t('details.tiers.gold.title')}
            requirement={t('details.tiers.gold.requirement')}
            benefits={[
              t('details.tiers.gold.benefits.swap_fee'),
              t('details.tiers.gold.benefits.comment_fee'),
            ]}
            gradientClass="from-yellow-500/10 to-amber-500/10 border-yellow-500/30"
            textColorClass="text-yellow-700 dark:text-yellow-300"
          />
          <StakingTierCard
            emoji="🥈"
            title={t('details.tiers.silver.title')}
            requirement={t('details.tiers.silver.requirement')}
            benefits={[
              t('details.tiers.silver.benefits.swap_fee'),
              t('details.tiers.silver.benefits.comment_fee'),
            ]}
            gradientClass="from-gray-400/10 to-slate-400/10 border-gray-400/30"
            textColorClass="text-gray-700 dark:text-gray-300"
          />
          <StakingTierCard
            emoji="🥉"
            title={t('details.tiers.bronze.title')}
            requirement={t('details.tiers.bronze.requirement')}
            benefits={[
              t('details.tiers.bronze.benefits.swap_fee'),
              t('details.tiers.bronze.benefits.comment_fee'),
            ]}
            gradientClass="from-orange-600/10 to-amber-600/10 border-orange-500/30"
            textColorClass="text-orange-700 dark:text-orange-300"
          />
        </div>
        <div className="text-xs text-muted-foreground text-center bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 p-2 rounded-md border border-border/30">
          ℹ️ {t('details.tiers.disclaimer')}
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
  gradientClass: string
  textColorClass: string
}

export function StakingTierCard({
  emoji,
  title,
  requirement,
  benefits,
  gradientClass,
  textColorClass,
}: StakingTierCardProps) {
  return (
    <div
      className={`bg-gradient-to-r ${gradientClass} rounded-lg border p-3 hover:border-opacity-50 transition-all duration-300`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-lg flex-shrink-0">{emoji}</div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${textColorClass}`}>{title}</p>
          <p className="text-xs text-muted-foreground">{requirement}</p>
        </div>
      </div>
      <div className="space-y-1">
        {benefits.map((benefit, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <CheckCircle
              size={10}
              className="text-green-500 flex-shrink-0 mt-1"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              {benefit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
