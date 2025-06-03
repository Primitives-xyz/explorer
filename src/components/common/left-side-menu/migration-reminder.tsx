import { useMigrationCheck } from '@/components/stake/hooks/use-migration-check'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function MigrationReminder() {
  const t = useTranslations('stake.migration')
  const { needsMigration, isLoading } = useMigrationCheck()
  const { isLoggedIn } = useCurrentWallet()

  // Don't show if not logged in, still loading, or no migration needed
  if (!isLoggedIn || isLoading || !needsMigration) {
    return null
  }

  return (
    <Card className="border-amber-500 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="text-amber-500 font-bold flex items-center gap-2">
          <AlertTriangle size={16} />
          {t('required_title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('required_description')}
        </p>
        <Button className="w-full" href={route('stake')}>
          {t('migrate_button')}
        </Button>
      </CardContent>
    </Card>
  )
}
