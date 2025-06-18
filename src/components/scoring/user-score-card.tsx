'use client'

import { useUserScore } from '@/hooks/use-user-score'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { cn } from '@/utils/utils'
import { Flame, Star, Target, TrendingUp, Trophy, Zap } from 'lucide-react'
import { useState } from 'react'

export function UserScoreCard() {
  const [timeframe, setTimeframe] = useState<
    'lifetime' | 'daily' | 'weekly' | 'monthly'
  >('lifetime')
  const {
    score,
    rank,
    percentile,
    recentActions,
    achievements,
    streaks,
    loading,
  } = useUserScore({ timeframe })

  const timeframeOptions = [
    { value: 'lifetime', label: 'All Time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Today' },
  ] as const

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 animate-pulse">
        <div className="h-32 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className="bg-background/98 backdrop-blur-md rounded-lg p-6 space-y-6 border-2 border-border shadow-xl">
      {/* Header with timeframe selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Score</h3>
        <div className="flex gap-1 bg-muted/95 rounded-lg p-1 border border-border/60">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value)}
              className={cn(
                'px-3 py-1 text-sm rounded transition-colors',
                timeframe === option.value
                  ? 'bg-background shadow-md text-foreground border border-border/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Score Display */}
      <div className="text-center bg-background/95 rounded-lg py-6 px-4 border border-border/60 shadow-sm">
        <div className="text-4xl font-bold text-primary drop-shadow-sm">
          {formatSmartNumber(score, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
        <div className="text-sm text-muted-foreground mt-1 font-medium">
          {rank ? (
            <>
              Rank #{rank} • Top {percentile}%
            </>
          ) : (
            'Start trading to earn points!'
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Trading Streak */}
        <div className="bg-background/95 rounded-lg p-4 border border-border/60 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Trading Streak</span>
          </div>
          <div className="text-2xl font-bold">
            {streaks.trading} {streaks.trading === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-background/95 rounded-lg p-4 border border-border/60 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Achievements</span>
          </div>
          <div className="text-2xl font-bold">{achievements.length}</div>
        </div>
      </div>

      {/* Recent Actions */}
      {recentActions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Recent Activity
          </h4>
          <div className="space-y-2 bg-background/90 rounded-lg p-3 border border-border/40">
            {recentActions.slice(0, 3).map((action, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  {getActionIcon(action.action)}
                  <span className="text-muted-foreground font-medium">
                    {formatActionName(action.action)}
                  </span>
                </div>
                <span className="font-semibold text-primary">
                  +{action.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Badges */}
      {achievements.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Recent Achievements
          </h4>
          <div className="flex flex-wrap gap-2 bg-background/90 rounded-lg p-3 border border-border/40">
            {achievements.slice(0, 5).map((achievement) => (
              <div
                key={achievement}
                className="bg-primary/25 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/30 shadow-sm"
              >
                {formatAchievementName(achievement)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getActionIcon(action: string) {
  switch (action) {
    case 'TRADE_EXECUTE':
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case 'COPY_TRADE':
      return <Zap className="h-4 w-4 text-blue-500" />
    case 'FIRST_TRADE':
    case 'FIRST_PROFITABLE_TRADE':
      return <Star className="h-4 w-4 text-yellow-500" />
    default:
      return <Target className="h-4 w-4 text-gray-500" />
  }
}

function formatActionName(action: string): string {
  const actionNames: Record<string, string> = {
    TRADE_EXECUTE: 'Executed Trade',
    COPY_TRADE: 'Copied Trade',
    COPIED_BY_OTHERS: 'Got Copied',
    STAKE_SSE: 'Staked SSE',
    FIRST_TRADE: 'First Trade!',
    FIRST_PROFITABLE_TRADE: 'First Profit!',
    TRADING_STREAK_3: '3 Day Streak!',
    TRADING_STREAK_7: 'Week Streak!',
    DAILY_TRADE: 'Daily Trade',
    DAILY_VOLUME_BONUS: 'Volume Bonus',
  }
  return actionNames[action] || action.replace(/_/g, ' ').toLowerCase()
}

function formatAchievementName(achievement: string): string {
  const achievementNames: Record<string, string> = {
    FIRST_TRADE: '🎯 First Trade',
    FIRST_PROFITABLE_TRADE: '💰 First Profit',
    FIRST_COPY_TRADE: '⚡ First Copy',
    FIRST_TIME_COPIED: '🌟 First Follower',
    TRADING_STREAK_3: '🔥 3 Day Streak',
    TRADING_STREAK_7: '🔥 Week Streak',
    TRADING_STREAK_30: '🔥 Month Streak',
    VOLUME_MILESTONE_1K: '📈 $1K Volume',
    VOLUME_MILESTONE_10K: '📈 $10K Volume',
    VOLUME_MILESTONE_100K: '📈 $100K Volume',
    PROFIT_MILESTONE_100: '💎 $100 Profit',
    PROFIT_MILESTONE_1K: '💎 $1K Profit',
    PROFIT_MILESTONE_10K: '💎 $10K Profit',
  }
  return (
    achievementNames[achievement] ||
    achievement.replace(/_/g, ' ').toLowerCase()
  )
}
