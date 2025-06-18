'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover/popover'
import { useUserScore } from '@/hooks/use-user-score'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  Award,
  Calendar,
  Copy,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface ScoreIndicatorProps {
  className?: string
}

// Map action types to friendly names and icons
const ACTION_DISPLAY_CONFIG = {
  TRADE_EXECUTE: {
    name: 'Trade Executed',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  COPY_TRADE: { name: 'Copy Trade', icon: Copy, color: 'text-blue-500' },
  COPIED_BY_OTHERS: {
    name: 'Trade Copied',
    icon: Users,
    color: 'text-purple-500',
  },
  STAKE_SSE: { name: 'Staked SSE', icon: Target, color: 'text-orange-500' },
  CLAIM_STAKING_REWARDS: {
    name: 'Claimed Rewards',
    icon: Award,
    color: 'text-yellow-500',
  },
  DAILY_LOGIN: { name: 'Daily Login', icon: Calendar, color: 'text-gray-500' },
  DAILY_TRADE: {
    name: 'First Trade Today',
    icon: Zap,
    color: 'text-green-500',
  },
  DAILY_VOLUME_BONUS: {
    name: 'Volume Bonus',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  FIRST_TRADE: { name: 'First Trade!', icon: Award, color: 'text-yellow-500' },
  FIRST_COPY_TRADE: {
    name: 'First Copy Trade!',
    icon: Award,
    color: 'text-yellow-500',
  },
  FIRST_TIME_COPIED: {
    name: 'First Time Copied!',
    icon: Award,
    color: 'text-yellow-500',
  },
  TRADING_STREAK_3: {
    name: '3 Day Streak!',
    icon: Zap,
    color: 'text-orange-500',
  },
  TRADING_STREAK_7: {
    name: '7 Day Streak!',
    icon: Zap,
    color: 'text-orange-500',
  },
  TRADING_STREAK_30: {
    name: '30 Day Streak!',
    icon: Zap,
    color: 'text-orange-500',
  },
  VOLUME_MILESTONE_1K: {
    name: '$1K Volume!',
    icon: Award,
    color: 'text-yellow-500',
  },
  VOLUME_MILESTONE_10K: {
    name: '$10K Volume!',
    icon: Award,
    color: 'text-yellow-500',
  },
  VOLUME_MILESTONE_100K: {
    name: '$100K Volume!',
    icon: Award,
    color: 'text-yellow-500',
  },
}

export function ScoreIndicator({ className }: ScoreIndicatorProps) {
  const { mainProfile } = useCurrentWallet()
  const { score, rank, loading, recentActions } = useUserScore({
    timeframe: 'lifetime',
  })
  const [open, setOpen] = useState(false)

  // Don't show if not logged in
  if (!mainProfile) return null

  if (loading) {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-xs text-muted-foreground">Score</p>
            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center justify-between w-full group cursor-pointer',
            className
          )}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(!open)
          }}
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Aura Score</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-semibold leading-none">
                  {formatSmartNumber(score, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
                {rank && (
                  <span className="text-xs text-muted-foreground">#{rank}</span>
                )}
              </div>
            </div>
          </div>
          <TrendingUp className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="center" sideOffset={10}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your Score Activity</h3>
            <Link
              href={`/${mainProfile.username}`}
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              View Profile
            </Link>
          </div>
        </div>

        <div className="p-2 max-h-96 overflow-y-auto">
          {recentActions && recentActions.length > 0 ? (
            <div className="space-y-1">
              {recentActions.map((action, index) => {
                const config =
                  ACTION_DISPLAY_CONFIG[
                    action.action as keyof typeof ACTION_DISPLAY_CONFIG
                  ]
                if (!config) return null

                const Icon = config.icon

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        'p-1.5 rounded-full bg-muted',
                        config.color
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {config.name}
                        </span>
                        <span className="text-sm font-bold text-green-500">
                          +{action.score}
                        </span>
                      </div>

                      {action.metadata?.volumeUSD && (
                        <span className="text-xs text-muted-foreground">
                          $
                          {formatSmartNumber(action.metadata.volumeUSD, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}{' '}
                          volume
                        </span>
                      )}

                      {action.metadata?.copierCount !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {action.metadata.copierCount + 1} copiers
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(action.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Start trading to earn points!</p>
            </div>
          )}
        </div>

        {recentActions && recentActions.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/30">
            <Link
              href="/leaderboard"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
              onClick={() => setOpen(false)}
            >
              View Leaderboard
              <TrendingUp className="h-3 w-3" />
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
