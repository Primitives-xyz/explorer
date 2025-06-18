interface ActionConfig {
  base: number
  oneTime?: boolean
  dailyLimit?: number
  multipliers?: Record<string, (value: any) => number>
}

type ActionsConfig = Record<string, ActionConfig>

export const SCORING_CONFIG = {
  actions: {
    // Trading Actions
    TRADE_EXECUTE: {
      base: 10,
      multipliers: {
        volumeUSD: (volume: number) => {
          if (volume >= 10000) return 5.0
          if (volume >= 5000) return 3.0
          if (volume >= 1000) return 2.0
          if (volume >= 100) return 1.5
          return 1.0
        },
        // Removed profit multiplier - PNL handled by another team member
      },
    },

    // Copy Trading
    COPY_TRADE: {
      base: 5,
      multipliers: {
        volumeUSD: (volume: number) => {
          // Same volume multipliers as regular trades
          if (volume >= 10000) return 5.0
          if (volume >= 5000) return 3.0
          if (volume >= 1000) return 2.0
          if (volume >= 100) return 1.5
          return 1.0
        },
        speedBonus: (delayMs: number) => {
          if (delayMs < 1000) return 2.0 // Under 1 second
          if (delayMs < 5000) return 1.5 // Under 5 seconds
          if (delayMs < 30000) return 1.2 // Under 30 seconds
          return 1.0
        },
      },
    },

    COPIED_BY_OTHERS: {
      base: 20,
      multipliers: {
        copierCount: (count: number) => Math.min(count, 10), // Up to 10x
        // Removed profit multiplier - PNL handled by another team member
      },
    },

    // Staking
    STAKE_SSE: {
      base: 15,
      multipliers: {
        amount: (amount: number) => {
          if (amount >= 100000) return 5.0
          if (amount >= 50000) return 3.0
          if (amount >= 10000) return 2.0
          if (amount >= 1000) return 1.5
          return 1.0
        },
        duration: (days: number) => {
          if (days >= 365) return 3.0
          if (days >= 180) return 2.0
          if (days >= 30) return 1.5
          return 1.0
        },
      },
    },

    CLAIM_STAKING_REWARDS: {
      base: 5,
      multipliers: {
        amount: (amount: number) => {
          if (amount >= 10000) return 3.0
          if (amount >= 1000) return 2.0
          return 1.0
        },
      },
    },

    // Social Actions
    // Removed social actions for now - can add back later

    // Milestones
    FIRST_TRADE: { base: 100, oneTime: true },
    FIRST_COPY_TRADE: { base: 150, oneTime: true },
    FIRST_TIME_COPIED: { base: 500, oneTime: true },
    TRADING_STREAK_3: { base: 200, oneTime: true },
    TRADING_STREAK_7: { base: 500, oneTime: true },
    TRADING_STREAK_30: { base: 2000, oneTime: true },
    VOLUME_MILESTONE_1K: { base: 250, oneTime: true },
    VOLUME_MILESTONE_10K: { base: 1000, oneTime: true },
    VOLUME_MILESTONE_100K: { base: 5000, oneTime: true },

    // Daily Actions
    DAILY_LOGIN: { base: 5, dailyLimit: 1 },
    DAILY_TRADE: { base: 10, dailyLimit: 1 },
    DAILY_VOLUME_BONUS: { base: 50, dailyLimit: 1 }, // For >$1000 daily volume
  } as ActionsConfig,

  // Decay factors for time-based scoring
  decay: {
    daily: 0.9, // Previous day scores worth 90%
    weekly: 0.8, // Previous week scores worth 80%
    monthly: 0.7, // Previous month scores worth 70%
  },

  // Categories for filtering
  categories: {
    TRADE_EXECUTE: 'trading',
    COPY_TRADE: 'copying',
    COPIED_BY_OTHERS: 'influence',
    STAKE_SSE: 'staking',
    CLAIM_STAKING_REWARDS: 'staking',

    FIRST_TRADE: 'milestone',
    FIRST_COPY_TRADE: 'milestone',
    FIRST_TIME_COPIED: 'milestone',
    TRADING_STREAK_3: 'milestone',
    TRADING_STREAK_7: 'milestone',
    TRADING_STREAK_30: 'milestone',
    VOLUME_MILESTONE_1K: 'milestone',
    VOLUME_MILESTONE_10K: 'milestone',
    VOLUME_MILESTONE_100K: 'milestone',
    DAILY_LOGIN: 'daily',
    DAILY_TRADE: 'daily',
    DAILY_VOLUME_BONUS: 'daily',
  } as const,
}

export type ActionType = keyof typeof SCORING_CONFIG.actions
export type ScoringCategory =
  | 'trading'
  | 'copying'
  | 'influence'
  | 'staking'
  | 'social'
  | 'milestone'
  | 'daily'
