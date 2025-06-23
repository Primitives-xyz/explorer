'use client'

import { ShareSolidScoreDialog } from '@/components/pudgy/components/share-tweet-dialog/share-solid-score-dialog'
import { useSolidScoreLeaderboardInfinite } from '@/components/solid-score/hooks/use-solid-score-leaderboard-infinite'
import { Button, ButtonSize, Spinner } from '@/components/ui'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs/tabs'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { DataTableLeaderboard } from './data-table-leaderboard'
import { DataTableUserPosition } from './data-table-user-position'
import { SSELeaderboard } from './sse-leaderboard'

export function LeaderboardContent() {
  const {
    data: solidScoreData,
    loading: solidScoreLoading,
    onLoadMore,
    hasMore,
    loading: loadingMore,
  } = useSolidScoreLeaderboardInfinite({ pageSize: 20 })
  const { mainProfile, loading: walletLoading } = useCurrentWallet()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('sse-scores')
  const t = useTranslations('menu.solid_score.leaderboard')

  const hasRevealedShare = !!mainProfile?.userHasClickedOnShareHisSolidScore

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  if (!mainProfile?.username) {
    return null
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {t('title')}
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background/50 backdrop-blur-sm border border-foreground/10 rounded-lg p-1">
          <TabsTrigger
            value="sse-scores"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold"
          >
            {t('tabs.sse_scores')}
          </TabsTrigger>
          <TabsTrigger
            value="solid-scores"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold"
          >
            {t('tabs.solid_scores')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sse-scores" className="space-y-4">
          <SSELeaderboard currentUsername={mainProfile?.username} />
        </TabsContent>

        <TabsContent value="solid-scores" className="space-y-4">
          <div className="space-y-4 relative">
            <div
              className={cn({
                'blur-sm pointer-events-none': !hasRevealedShare,
              })}
            >
              <DataTableLeaderboard
                data={solidScoreData ?? []}
                loading={solidScoreLoading && solidScoreData?.length === 0}
                currentUsername={mainProfile?.username}
                onLoadMore={onLoadMore}
                hasMore={hasMore}
                loadingMore={loadingMore}
              />
              {mainProfile && <DataTableUserPosition />}
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
        </TabsContent>
      </Tabs>

      <ShareSolidScoreDialog open={open} setOpen={setOpen} />
    </div>
  )
}
