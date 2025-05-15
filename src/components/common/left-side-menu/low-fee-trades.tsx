import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { route } from '@/utils/route'
import { ArrowLeftRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function LowFeeTrades() {
  const t = useTranslations('menu.low_fee_trades')

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary font-bold">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <p className="text-sm  text-muted-foreground">{t('description')}</p>
        <Button className="w-full" href={route('trade')}>
          <ArrowLeftRight size={16} />
          {t('trade_button')}
        </Button>
      </CardContent>
    </Card>
  )
}
