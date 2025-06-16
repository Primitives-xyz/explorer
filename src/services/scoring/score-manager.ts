import redis from '@/utils/redis'
import { ActionType, SCORING_CONFIG, ScoringCategory } from './scoring-config'

interface ScoreMetadata {
  [key: string]: any
  category?: ScoringCategory
}

interface LeaderboardEntry {
  userId: string
  score: number
  rank: number
}

interface UserScoreData {
  score: number
  rank: number | null
  recentActions: Array<{
    action: string
    score: number
    metadata: ScoreMetadata
    timestamp: string
  }>
  achievements: string[]
  streaks: {
    trading: number
    lastTradeDate: string | null
  }
}

interface ActionConfig {
  base: number
  oneTime?: boolean
  dailyLimit?: number
  multipliers?: Record<string, (value: any) => number>
}

export class ScoreManager {
  private redis = redis

  async addScore(
    userId: string,
    action: ActionType,
    metadata: ScoreMetadata = {}
  ): Promise<number> {
    const config = SCORING_CONFIG.actions[action] as ActionConfig
    if (!config) throw new Error(`Unknown action: ${action}`)

    // Check if action is one-time only
    if (config.oneTime) {
      const hasAchievement = await this.redis.sismember(
        `user:${userId}:achievements`,
        action
      )
      if (hasAchievement) return 0
    }

    // Check daily limits
    if (config.dailyLimit) {
      const today = new Date().toISOString().split('T')[0]
      const dailyCount = await this.redis.hget(
        `user:${userId}:daily:${today}`,
        action
      )
      if (dailyCount && parseInt(dailyCount as string) >= config.dailyLimit)
        return 0
    }

    // Calculate score with multipliers
    let score = config.base

    if (config.multipliers) {
      for (const [key, multiplierFn] of Object.entries(config.multipliers)) {
        if (metadata[key] !== undefined && typeof multiplierFn === 'function') {
          score *= multiplierFn(metadata[key])
        }
      }
    }

    // Round score
    score = Math.round(score)

    // Add category from config if not provided
    const categoryKey = action as keyof typeof SCORING_CONFIG.categories
    if (!metadata.category && SCORING_CONFIG.categories[categoryKey]) {
      metadata.category = SCORING_CONFIG.categories[categoryKey]
    }

    // Update scores in parallel
    const pipeline = this.redis.pipeline()
    const now = new Date()
    const dateKey = now.toISOString().split('T')[0]
    const weekKey = `${now.getFullYear()}-${this.getWeekNumber(now)}`
    const monthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}`

    // Update various leaderboards
    pipeline.zincrby('scores:lifetime', score, userId)
    pipeline.zincrby(`scores:daily:${dateKey}`, score, userId)
    pipeline.zincrby(`scores:weekly:${weekKey}`, score, userId)
    pipeline.zincrby(`scores:monthly:${monthKey}`, score, userId)

    // Category-specific scores
    if (metadata.category) {
      pipeline.zincrby(`scores:category:${metadata.category}`, score, userId)
    }

    // Update action counters
    pipeline.hincrby(`user:${userId}:actions`, action, 1)
    pipeline.hincrby(`user:${userId}:actions:${dateKey}`, action, 1)

    // Track daily actions for limits
    if (config.dailyLimit) {
      pipeline.hincrby(`user:${userId}:daily:${dateKey}`, action, 1)
      pipeline.expire(`user:${userId}:daily:${dateKey}`, 60 * 60 * 24)
    }

    // Add to recent actions
    const actionRecord = {
      action,
      score,
      metadata,
      timestamp: now.toISOString(),
    }
    pipeline.lpush(`user:${userId}:recent`, JSON.stringify(actionRecord))
    pipeline.ltrim(`user:${userId}:recent`, 0, 99) // Keep last 100 actions

    // Track one-time achievements
    if (config.oneTime) {
      pipeline.sadd(`user:${userId}:achievements`, action)
    }

    // Set expiry for time-based keys
    pipeline.expire(`scores:daily:${dateKey}`, 60 * 60 * 24 * 7) // 7 days
    pipeline.expire(`scores:weekly:${weekKey}`, 60 * 60 * 24 * 30) // 30 days
    pipeline.expire(`scores:monthly:${monthKey}`, 60 * 60 * 24 * 365) // 1 year
    pipeline.expire(`user:${userId}:actions:${dateKey}`, 60 * 60 * 24 * 7)

    await pipeline.exec()

    // Update streaks and check achievements
    await Promise.all([
      this.updateStreaks(userId, action),
      this.checkAchievements(userId, action, metadata, score),
    ])

    return score
  }

  async getUserScore(
    userId: string,
    timeframe: 'lifetime' | 'daily' | 'weekly' | 'monthly' = 'lifetime'
  ): Promise<number> {
    const key =
      timeframe === 'lifetime'
        ? 'scores:lifetime'
        : `scores:${timeframe}:${this.getCurrentTimeKey(timeframe)}`

    const score = await this.redis.zscore(key, userId)
    return score ? Number(score) : 0
  }

  async getUserScoreData(
    userId: string,
    timeframe: 'lifetime' | 'daily' | 'weekly' | 'monthly' = 'lifetime'
  ): Promise<UserScoreData> {
    const [
      score,
      rank,
      recentActions,
      achievements,
      tradingStreak,
      lastTradeDate,
    ] = await Promise.all([
      this.getUserScore(userId, timeframe),
      this.getUserRank(userId, timeframe),
      this.redis.lrange(`user:${userId}:recent`, 0, 9),
      this.redis.smembers(`user:${userId}:achievements`),
      this.redis.get(`user:${userId}:streak:trading`),
      this.redis.get(`user:${userId}:streak:last_trade`),
    ])

    return {
      score,
      rank,
      recentActions: recentActions
        .filter(
          (a: string | null): a is string => a !== null && a !== undefined
        )
        .map((a: string) => {
          try {
            return JSON.parse(a)
          } catch {
            return null
          }
        })
        .filter((a: any): a is any => a !== null),
      achievements: achievements as string[],
      streaks: {
        trading: tradingStreak ? parseInt(tradingStreak as string) : 0,
        lastTradeDate: lastTradeDate as string | null,
      },
    }
  }

  async getLeaderboard(
    timeframe: 'lifetime' | 'daily' | 'weekly' | 'monthly' = 'lifetime',
    limit: number = 100,
    offset: number = 0,
    category?: ScoringCategory
  ): Promise<LeaderboardEntry[]> {
    const key = category
      ? `scores:category:${category}`
      : timeframe === 'lifetime'
      ? 'scores:lifetime'
      : `scores:${timeframe}:${this.getCurrentTimeKey(timeframe)}`

    const results = (await this.redis.zrange(key, offset, offset + limit - 1, {
      rev: true,
      withScores: true,
    })) as string[]

    const leaderboard: LeaderboardEntry[] = []
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        userId: results[i] as string,
        score: parseInt(results[i + 1] as string),
        rank: offset + i / 2 + 1,
      })
    }

    return leaderboard
  }

  async getUserRank(
    userId: string,
    timeframe: 'lifetime' | 'daily' | 'weekly' | 'monthly' = 'lifetime',
    category?: ScoringCategory
  ): Promise<number | null> {
    const key = category
      ? `scores:category:${category}`
      : timeframe === 'lifetime'
      ? 'scores:lifetime'
      : `scores:${timeframe}:${this.getCurrentTimeKey(timeframe)}`

    const rank = await this.redis.zrevrank(key, userId)
    return rank !== null ? rank + 1 : null
  }

  async getUserPercentile(
    userId: string,
    timeframe: 'lifetime' | 'daily' | 'weekly' | 'monthly' = 'lifetime'
  ): Promise<number> {
    const key =
      timeframe === 'lifetime'
        ? 'scores:lifetime'
        : `scores:${timeframe}:${this.getCurrentTimeKey(timeframe)}`

    const [rank, total] = await Promise.all([
      this.redis.zrevrank(key, userId),
      this.redis.zcard(key),
    ])

    if (rank === null || total === 0) return 0
    return Math.round(((total - rank - 1) / total) * 100)
  }

  private async updateStreaks(userId: string, action: ActionType) {
    if (action === 'TRADE_EXECUTE' || action === 'COPY_TRADE') {
      const today = new Date().toISOString().split('T')[0]
      const lastTradeDate = await this.redis.get(
        `user:${userId}:streak:last_trade`
      )

      if (!lastTradeDate) {
        // First trade
        await this.redis.set(`user:${userId}:streak:trading`, 1)
        await this.redis.set(`user:${userId}:streak:last_trade`, today)
      } else {
        const lastDate = new Date(lastTradeDate as string)
        const todayDate = new Date(today)
        const daysDiff = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysDiff === 1) {
          // Consecutive day - increment streak
          const currentStreak = await this.redis.incr(
            `user:${userId}:streak:trading`
          )
          await this.redis.set(`user:${userId}:streak:last_trade`, today)

          // Check streak milestones
          if (currentStreak === 3) {
            await this.addScore(userId, 'TRADING_STREAK_3', {})
          } else if (currentStreak === 7) {
            await this.addScore(userId, 'TRADING_STREAK_7', {})
          } else if (currentStreak === 30) {
            await this.addScore(userId, 'TRADING_STREAK_30', {})
          }
        } else if (daysDiff > 1) {
          // Streak broken - reset to 1
          await this.redis.set(`user:${userId}:streak:trading`, 1)
          await this.redis.set(`user:${userId}:streak:last_trade`, today)
        }
        // If daysDiff === 0, already traded today, do nothing
      }
    }
  }

  private async checkAchievements(
    userId: string,
    action: ActionType,
    metadata: ScoreMetadata,
    earnedScore: number
  ) {
    // Check first-time achievements
    if (action === 'TRADE_EXECUTE') {
      const tradeCount = await this.redis.hget(
        `user:${userId}:actions`,
        'TRADE_EXECUTE'
      )
      if (tradeCount === '1') {
        await this.addScore(userId, 'FIRST_TRADE', {})
      }

      // Check profit milestones
      if (metadata.profitUsd && metadata.profitUsd > 0) {
        const hasProfitable = await this.redis.sismember(
          `user:${userId}:achievements`,
          'FIRST_PROFITABLE_TRADE'
        )
        if (!hasProfitable) {
          await this.addScore(userId, 'FIRST_PROFITABLE_TRADE', {})
        }

        // Track cumulative profit
        const cumulativeProfit = await this.redis.incrbyfloat(
          `user:${userId}:stats:profit`,
          metadata.profitUsd
        )

        if (
          cumulativeProfit >= 100 &&
          !(await this.redis.sismember(
            `user:${userId}:achievements`,
            'PROFIT_MILESTONE_100'
          ))
        ) {
          await this.addScore(userId, 'PROFIT_MILESTONE_100', {})
        }
        if (
          cumulativeProfit >= 1000 &&
          !(await this.redis.sismember(
            `user:${userId}:achievements`,
            'PROFIT_MILESTONE_1K'
          ))
        ) {
          await this.addScore(userId, 'PROFIT_MILESTONE_1K', {})
        }
        if (
          cumulativeProfit >= 10000 &&
          !(await this.redis.sismember(
            `user:${userId}:achievements`,
            'PROFIT_MILESTONE_10K'
          ))
        ) {
          await this.addScore(userId, 'PROFIT_MILESTONE_10K', {})
        }
      }

      // Check volume milestones
      if (metadata.volumeUSD) {
        const cumulativeVolume = await this.redis.incrbyfloat(
          `user:${userId}:stats:volume`,
          metadata.volumeUSD
        )

        if (
          cumulativeVolume >= 1000 &&
          !(await this.redis.sismember(
            `user:${userId}:achievements`,
            'VOLUME_MILESTONE_1K'
          ))
        ) {
          await this.addScore(userId, 'VOLUME_MILESTONE_1K', {})
        }
        if (
          cumulativeVolume >= 10000 &&
          !(await this.redis.sismember(
            `user:${userId}:achievements`,
            'VOLUME_MILESTONE_10K'
          ))
        ) {
          await this.addScore(userId, 'VOLUME_MILESTONE_10K', {})
        }
        if (
          cumulativeVolume >= 100000 &&
          !(await this.redis.sismember(
            `user:${userId}:achievements`,
            'VOLUME_MILESTONE_100K'
          ))
        ) {
          await this.addScore(userId, 'VOLUME_MILESTONE_100K', {})
        }

        // Check daily volume bonus
        const today = new Date().toISOString().split('T')[0]
        const dailyVolume = await this.redis.incrbyfloat(
          `user:${userId}:daily_volume:${today}`,
          metadata.volumeUSD
        )
        await this.redis.expire(
          `user:${userId}:daily_volume:${today}`,
          60 * 60 * 24
        )

        if (dailyVolume >= 1000) {
          await this.addScore(userId, 'DAILY_VOLUME_BONUS', {})
        }
      }
    }

    if (action === 'COPY_TRADE') {
      const copyCount = await this.redis.hget(
        `user:${userId}:actions`,
        'COPY_TRADE'
      )
      if (copyCount === '1') {
        await this.addScore(userId, 'FIRST_COPY_TRADE', {})
      }
    }

    if (action === 'COPIED_BY_OTHERS') {
      const copiedCount = await this.redis.hget(
        `user:${userId}:actions`,
        'COPIED_BY_OTHERS'
      )
      if (copiedCount === '1') {
        await this.addScore(userId, 'FIRST_TIME_COPIED', {})
      }
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  private getCurrentTimeKey(timeframe: 'daily' | 'weekly' | 'monthly'): string {
    const now = new Date()
    switch (timeframe) {
      case 'daily':
        return now.toISOString().split('T')[0]
      case 'weekly':
        return `${now.getFullYear()}-${this.getWeekNumber(now)}`
      case 'monthly':
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          '0'
        )}`
    }
  }
}

export const scoreManager = new ScoreManager()
