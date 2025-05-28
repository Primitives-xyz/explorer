'use client'

import { useSolidScoreLeaderboard } from '@/components/solid-score/hooks/use-solid-score-leaderboard'
import { Button, ButtonSize, Spinner } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSpecialUser } from '@/utils/user-permissions'
import { cn } from '@/utils/utils'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DataTableLeaderboard } from './data-table-leaderboard'
import { DataTableUserPosition } from './data-table-user-position'
import { SolidScoreShareDialog } from './solid-score-share-dialog'

export function LeaderboardContent() {
  const { data, loading } = useSolidScoreLeaderboard()
  const { mainProfile, loading: walletLoading } = useCurrentWallet()
  const [open, setOpen] = useState(false)
  const t = useTranslations('menu.solid_score.leaderboard')
  const router = useRouter()

  useEffect(() => {
    if (!walletLoading && mainProfile?.username) {
      if (!isSpecialUser(mainProfile)) {
        router.push('/')
      }
    }
  }, [walletLoading, mainProfile, router])

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

  if (!mainProfile?.username || !isSpecialUser(mainProfile)) {
    return null
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <div className="space-y-4 relative">
        <div
          className={cn({
            'blur-sm pointer-events-none': !hasRevealedShare,
          })}
        >
          <DataTableLeaderboard
            data={data ?? []}
            loading={loading}
            currentUsername={mainProfile?.username}
          />
          {mainProfile && !isUserInTopList && <DataTableUserPosition />}
        </div>
        {!hasRevealedShare && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-xs grid gap-5 border border-foreground/20 bg-modal backdrop-blur-xl text-modal-foreground p-6 shadow-lg rounded outline-hidden">
              <div className="flex flex-col gap-2 text-md text-center">
                <p className="font-bold">{t('locked.title')}</p>
                <p>{t('locked.description')}</p>
              </div>
              <Button size={ButtonSize.LG} onClick={() => setOpen(true)}>
                {t('locked.unlock_button')}
              </Button>
            </div>
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
