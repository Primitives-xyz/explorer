import { Card, CardContent, CardHeader } from '@/components/ui'
import { CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function TopDetails() {
  const t = useTranslations('stake')
  return (
    <Card>
      <CardHeader>
        <p className="text-lg">{t('details.benefits.title')}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-primary font-bold">
            {t('details.benefits.fee_sharing.title')}
          </p>
          <p className="text-sm">
            {t('details.benefits.fee_sharing.description')}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-primary font-bold">
            {t('details.benefits.flexible_staking.title')}
          </p>
          <p className="text-sm">
            {t('details.benefits.flexible_staking.description')}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-primary font-bold">
            {t('details.benefits.how_it_works.title')}
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex gap-2 items-center">
              <div>
                <CheckCircle size={14} className="text-primary" />
              </div>
              <span>{t('details.benefits.how_it_works.point1')}</span>
            </li>
            <li className="flex gap-2 items-center">
              <div>
                <CheckCircle size={14} className="text-primary" />
              </div>
              <span>{t('details.benefits.how_it_works.point2')}</span>
            </li>
            <li className="flex gap-2 items-center">
              <div>
                <CheckCircle size={14} className="text-primary" />
              </div>
              <span>{t('details.benefits.how_it_works.point3')}</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
