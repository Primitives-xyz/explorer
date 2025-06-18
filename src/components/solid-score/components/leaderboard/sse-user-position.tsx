'use client'

import { useUserScore } from '@/hooks/use-user-score'
import { Avatar } from '@/components/ui/avatar/avatar'
import { Button, ButtonVariant } from '@/components/ui'
import { route } from '@/utils/route'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { cn } from '@/utils/utils'
import { useTranslations } from 'next-intl'

interface SSEUserPositionProps {
  username: string
  timeframe: 'lifetime' | 'daily' | 'weekly' | 'monthly'
}

export function SSEUserPosition({ username, timeframe }: SSEUserPositionProps) {
  const { score, rank, percentile, loading } = useUserScore({
    userId: username,
    timeframe,
  })
  const t = useTranslations('menu.solid_score.leaderboard')

  if (loading || !rank || rank <= 100) {
    // User is already in the leaderboard or data is loading
    return null
  }

  return (
    <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
      <p className="text-sm text-muted-foreground mb-2">{t('sse_scores.your_position')}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-primary font-bold">#{rank}</div>
          <Button
            variant={ButtonVariant.LINK}
            href={route('entity', { id: username })}
            className="p-0 h-auto"
          >
            <Avatar username={username} size={24} className="w-6 h-6" />
            <p className="truncate font-semibold">{username}</p>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-lg">🔥</span>
            <span className="font-semibold">
              {formatSmartNumber(score, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Top {percentile}%
          </div>
        </div>
      </div>
    </div>
  )
}