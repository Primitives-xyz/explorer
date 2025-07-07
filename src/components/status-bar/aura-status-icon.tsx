'use client'

import { Button, ButtonVariant, Spinner } from '@/components/ui'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover/popover'
import { useUserScore } from '@/hooks/use-user-score'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { formatDistanceToNow } from 'date-fns'
import {
  Award,
  Calendar,
  Copy,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const ACTION_DISPLAY_CONFIG = {
  TRADE_EXECUTE: {
    name: 'Trade Executed',
    icon: TrendingUp,
  },
  COPY_TRADE: { name: 'Copy Trade', icon: Copy },
  COPIED_BY_OTHERS: {
    name: 'Trade Copied',
    icon: Users,
  },
  STAKE_SSE: { name: 'Staked SSE', icon: Target },
  CLAIM_STAKING_REWARDS: {
    name: 'Claimed Rewards',
    icon: Award,
  },
  DAILY_LOGIN: { name: 'Daily Login', icon: Calendar },
  DAILY_TRADE: {
    name: 'First Trade Today',
    icon: Zap,
  },
  DAILY_VOLUME_BONUS: {
    name: 'Volume Bonus',
    icon: TrendingUp,
  },
  FIRST_TRADE: { name: 'First Trade!', icon: Award },
  FIRST_COPY_TRADE: {
    name: 'First Copy Trade!',
    icon: Award,
  },
  FIRST_TIME_COPIED: {
    name: 'First Time Copied!',
    icon: Award,
  },
  TRADING_STREAK_3: {
    name: '3 Day Streak!',
    icon: Zap,
  },
  TRADING_STREAK_7: {
    name: '7 Day Streak!',
    icon: Zap,
  },
  TRADING_STREAK_30: {
    name: '30 Day Streak!',
    icon: Zap,
  },
  VOLUME_MILESTONE_1K: {
    name: '$1K Volume!',
    icon: Award,
  },
  VOLUME_MILESTONE_10K: {
    name: '$10K Volume!',
    icon: Award,
  },
  VOLUME_MILESTONE_100K: {
    name: '$100K Volume!',
    icon: Award,
  },
}

// Helper function to calculate tier based on solid score
function calculateTier(solidScore: number): string {
  if (solidScore >= 50000) return 'Aeonian'
  if (solidScore >= 10000) return 'Celestial'
  if (solidScore >= 5000) return 'Luminary'
  if (solidScore >= 1000) return 'Orb'
  if (solidScore >= 100) return 'Ray'
  return 'Dust'
}

export function AuraStatusIcon() {
  const { score, rank, loading, recentActions } = useUserScore({
    timeframe: 'lifetime',
  })

  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={ButtonVariant.GHOST}
          className="hover:bg-transparent"
          onClick={() => {
            setOpen(!open)
          }}
        >
          <Image
            src="/images/status-bar/status-bar-form.svg"
            alt="Aura Status"
            width={18}
            height={18}
            className="mr-1"
          />
          <span className="font-bold mr-1 text-primary">
            {loading ? (
              <Spinner className="h-3 w-3" />
            ) : (
              formatSmartNumber(score, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            )}
          </span>
          {rank && (
            <>
              <span className="text-xs text-primary uppercase desktop">
                aura status: {calculateTier(score)}
              </span>
              <span className="text-xs text-primary uppercase mobile">
                {rank}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-[220px] max-w-xs"
        align="center"
        sideOffset={10}
      >
        {recentActions && recentActions.length > 0 ? (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {recentActions.slice(0, 3).map((action, index) => {
              const config =
                ACTION_DISPLAY_CONFIG[
                  action.action as keyof typeof ACTION_DISPLAY_CONFIG
                ]
              const Icon = config?.icon
              return (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {Icon ? <Icon className="h-3 w-3" /> : null}
                  <span className="truncate font-medium">
                    {config?.name || action.action}
                  </span>
                  <span className="font-bold text-primary">
                    +{action.score}
                  </span>
                  <span className="text-muted-foreground ml-auto whitespace-nowrap">
                    {formatDistanceToNow(new Date(action.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-2">
            No recent activity
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
