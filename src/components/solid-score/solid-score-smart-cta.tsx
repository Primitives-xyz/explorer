'use client'

import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Button, ButtonSize, Card, CardContent, Spinner } from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

export function SolidScoreSmartCta() {
  const { mainProfile, refetch } = useCurrentWallet()
  const pathname = usePathname()
  const isOnProfilePage = pathname?.startsWith('/profile')
  const t = useTranslations('solid_score.smart_cta')

  const { updateProfile, loading } = useUpdateProfile({
    username: mainProfile?.username || '',
  })

  const handleRevealClick = async () => {
    await updateProfile({
      properties: [
        {
          key: 'userRevealedTheSolidScore',
          value: true,
        },
      ],
    })
    await refetch()
  }

  if (!mainProfile?.username) {
    return null
  }

  if (!mainProfile.userRevealedTheSolidScore) {
    return (
      <div className={cn('flex gap-4', pathname === '/' && 'py-4')}>
        <Card>
          <CardContent className="p-2 max-w-40">
            <div className="flex flex-col gap-2 text-xs text-center">
              <p className="font-bold">{t('reveal.title')}</p>
              <p>{t('reveal.description')}</p>
            </div>
          </CardContent>
        </Card>

        <Button
          size={ButtonSize.LG}
          onClick={handleRevealClick}
          href={
            !isOnProfilePage
              ? route('entity', { id: mainProfile.username })
              : undefined
          }
          className="h-auto max-w-40"
        >
          {loading ? <Spinner size={16} /> : t('reveal.button')}
        </Button>
      </div>
    )
  }

  if (!mainProfile?.userHasClickedOnShareHisSolidScore) {
    return (
      <div className={cn('flex gap-4', pathname === '/' && 'py-4')}>
        <Card>
          <CardContent className="p-2 max-w-40">
            <div className="flex flex-col gap-2 text-xs text-center">
              <p className="font-bold">{t('unlock.title')}</p>
              <p>{t('unlock.description')}</p>
            </div>
          </CardContent>
        </Card>

        <Button
          size={ButtonSize.LG}
          href={route('leaderboard')}
          className="h-auto max-w-40"
        >
          {t('unlock.button')}
        </Button>
      </div>
    )
  }

  return null
}
