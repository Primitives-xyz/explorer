'use client'

import { useScoreLeaderboard } from '@/hooks/use-user-score'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { DataTable } from '@/components/ui/table/data-table'
import { SortableHeader } from '@/components/ui/table/sortable-header'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { route } from '@/utils/route'
import { cn } from '@/utils/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs'
import { SSEUserPosition } from './sse-user-position'

const baseColumnStyles = {
  rank: 'md:w-[100px]',
  username: 'flex-1 md:min-w-[200px]',
  score: 'md:w-[150px]',
}

interface SSELeaderboardProps {
  currentUsername?: string
}

type TimeframeType = 'lifetime' | 'daily' | 'weekly' | 'monthly'

export function SSELeaderboard({ currentUsername }: SSELeaderboardProps) {
  const [timeframe, setTimeframe] = useState<TimeframeType>('lifetime')
  const { leaderboard, loading } = useScoreLeaderboard({ 
    timeframe,
    limit: 100 
  })
  const t = useTranslations('menu.solid_score.leaderboard')
  const tTable = useTranslations('menu.solid_score.leaderboard.table')

  const isUserInTopList = leaderboard.some(
    (entry: { username?: string; userId: string }) => entry.username === currentUsername || entry.userId === currentUsername
  )

  const columns: ColumnDef<{
    userId: string
    username?: string
    score: number
    rank: number
    profileImage?: string | null
  }>[] = [
    {
      accessorKey: 'rank',
      header: ({ column }) => (
        <div className={baseColumnStyles.rank}>
          <SortableHeader label={tTable('columns.rank')} column={column} />
        </div>
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<number>()
        const isCurrentUser = row.original.username === currentUsername || 
                            row.original.userId === currentUsername
        return (
          <div
            className={cn(baseColumnStyles.rank, {
              'text-primary font-bold': isCurrentUser,
            })}
          >
            <span className="text-muted-foreground">#</span>
            <span className="font-semibold">{value}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'username',
      header: ({ column }) => (
        <div className={baseColumnStyles.username}>
          <SortableHeader label={tTable('columns.username')} column={column} />
        </div>
      ),
      cell: ({ row }) => {
        const username = row.original.username || row.original.userId
        const isCurrentUser = username === currentUsername

        return (
          <div className={baseColumnStyles.username}>
            <Button
              variant={ButtonVariant.LINK}
              href={route('entity', { id: username })}
              className={cn('p-0 h-auto max-w-[100px] md:max-w-[200px]', {
                'text-primary font-bold': isCurrentUser,
              })}
            >
              <Avatar
                imageUrl={row.original.profileImage || undefined}
                username={username}
                size={24}
                className="w-6 h-6"
              />
              <p className="truncate">{username}</p>
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'score',
      header: ({ column }) => (
        <div className={baseColumnStyles.score}>
          <SortableHeader label={tTable('columns.score')} column={column} />
        </div>
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<number>()
        const isCurrentUser = row.original.username === currentUsername || 
                            row.original.userId === currentUsername
        return (
          <div
            className={cn(baseColumnStyles.score, {
              'text-primary font-bold': isCurrentUser,
            })}
          >
            <div className="flex items-center gap-1">
              <span className="text-lg">🔥</span>
              <span className="font-semibold">
                {formatSmartNumber(value || 0, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        )
      },
    },
  ]

  const TimeframeSelector = () => (
    <div className="mb-4">
      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeframeType)}>
        <TabsList className="grid w-full grid-cols-4 bg-background/50 backdrop-blur-sm">
          <TabsTrigger value="lifetime" className="data-[state=active]:bg-primary/10">
            {t('tabs.timeframes.all_time')}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-primary/10">
            {t('tabs.timeframes.monthly')}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-primary/10">
            {t('tabs.timeframes.weekly')}
          </TabsTrigger>
          <TabsTrigger value="daily" className="data-[state=active]:bg-primary/10">
            {t('tabs.timeframes.today')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
        <h3 className="text-lg font-semibold mb-2">{t('sse_scores.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('sse_scores.description')}
        </p>
      </div>

      <TimeframeSelector />

      <DataTable
        data={leaderboard}
        columns={columns}
        loading={loading}
        tableClassName="h-[600px]"
        isSmall
      />

      {currentUsername && !isUserInTopList && (
        <SSEUserPosition username={currentUsername} timeframe={timeframe} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-foreground/10">
          <h4 className="font-semibold text-sm mb-1">{t('sse_scores.categories.trading.title')}</h4>
          <p className="text-xs text-muted-foreground">{t('sse_scores.categories.trading.description')}</p>
        </div>
        <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-foreground/10">
          <h4 className="font-semibold text-sm mb-1">{t('sse_scores.categories.staking.title')}</h4>
          <p className="text-xs text-muted-foreground">{t('sse_scores.categories.staking.description')}</p>
        </div>
        <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-foreground/10">
          <h4 className="font-semibold text-sm mb-1">{t('sse_scores.categories.social.title')}</h4>
          <p className="text-xs text-muted-foreground">{t('sse_scores.categories.social.description')}</p>
        </div>
      </div>
    </div>
  )
}