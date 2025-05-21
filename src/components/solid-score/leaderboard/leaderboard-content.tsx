'use client'

import { useSolidScoreLeaderboard } from '@/components/solid-score/hooks/use-solid-score-leaderboard'
import { SolidScoreShareDialog } from '@/components/solid-score/leaderboard/solid-score-share-dialog'
import { Button, ButtonSize, Spinner } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DataTableLeaderboard } from './data-table-leaderboard'
import { DataTableUserPosition } from './data-table-user-position'

const AUTHORIZED_USERNAMES = ['nehemiah', 'nemoblackburn', 'cedrick']

export function LeaderboardContent() {
  const { data, loading } = useSolidScoreLeaderboard()
  const { mainProfile, loading: walletLoading } = useCurrentWallet()
  const [open, setOpen] = useState(false)
  const t = useTranslations('menu.solid_score.leaderboard')
  const router = useRouter()

  useEffect(() => {
    if (!walletLoading && mainProfile?.username) {
      if (!AUTHORIZED_USERNAMES.includes(mainProfile.username)) {
        router.push('/')
      }
    }
  }, [walletLoading, mainProfile?.username, router])

  const hasRevealedShare = !!mainProfile?.userHasClickedOnShareHisSolidScore

  const isUserInTopList = data?.some(
    (item) => item.username === mainProfile?.username
  )

  if (walletLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  if (
    !mainProfile?.username ||
    !AUTHORIZED_USERNAMES.includes(mainProfile.username)
  ) {
    return null
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <div className="space-y-4 relative">
        <div className={hasRevealedShare ? '' : 'blur-sm pointer-events-none'}>
          <DataTableLeaderboard
            data={data ?? []}
            loading={loading}
            currentUsername={mainProfile?.username}
          />
          {mainProfile && !isUserInTopList && <DataTableUserPosition />}
        </div>
        {!hasRevealedShare && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={() => setOpen(true)} size={ButtonSize.LG}>
              {t('share_button')}
            </Button>
          </div>
        )}
        {hasRevealedShare && (
          <Button
            onClick={() => setOpen(true)}
            className="w-full"
            size={ButtonSize.LG}
          >
            {t('share_button')}
          </Button>
        )}
      </div>
      <SolidScoreShareDialog open={open} setOpen={setOpen} />
    </div>
  )
}
