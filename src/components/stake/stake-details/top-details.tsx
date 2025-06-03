import { Card, CardContent, CardHeader } from '@/components/ui'
import { CheckCircle, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function TopDetails() {
  const t = useTranslations('stake')

  return (
    <Card className="h-full border-0 shadow-md bg-gradient-to-br from-background via-background to-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-2 rounded-lg">
            <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-semibold">{t('details.benefits.title')}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-3">
          <div className="flex gap-3 p-3 bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-lg">
            <CheckCircle
              size={16}
              className="text-green-500 flex-shrink-0 mt-0.5"
            />
            <div className="min-w-0">
              <p className="font-medium text-sm text-green-700 dark:text-green-300">
                {t('details.benefits.fee_sharing.title')}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t('details.benefits.fee_sharing.description')}
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-lg">
            <CheckCircle
              size={16}
              className="text-blue-500 flex-shrink-0 mt-0.5"
            />
            <div className="min-w-0">
              <p className="font-medium text-sm text-blue-700 dark:text-blue-300">
                {t('details.benefits.flexible_staking.title')}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t('details.benefits.flexible_staking.description')}
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-lg">
            <CheckCircle
              size={16}
              className="text-purple-500 flex-shrink-0 mt-0.5"
            />
            <div className="min-w-0">
              <p className="font-medium text-sm text-purple-700 dark:text-purple-300">
                {t('details.benefits.how_it_works.title')}
              </p>
              <div className="text-xs text-muted-foreground mt-1 space-y-1 leading-relaxed">
                <p>• {t('details.benefits.how_it_works.point1')}</p>
                <p>• {t('details.benefits.how_it_works.point2')}</p>
                <p>• {t('details.benefits.how_it_works.point3')}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
