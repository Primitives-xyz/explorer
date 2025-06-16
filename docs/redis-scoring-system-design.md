# Redis-Based User Scoring System Design

## Overview

This document outlines a comprehensive scoring system using Upstash Redis to track user actions and maintain real-time score counters for your SSE platform.

## Architecture

### Core Components

1. **Action Tracking** - Monitor and score user activities
2. **Score Management** - Real-time score updates and aggregation
3. **Leaderboards** - Multiple time-based and category-based rankings
4. **Achievement System** - Milestones and badges
5. **Analytics** - User behavior insights

## Redis Data Structures

### 1. User Scores (Sorted Sets)

```
# Global lifetime scores
scores:lifetime -> ZADD scores:lifetime <score> <userId>

# Time-based scores
scores:daily:<YYYY-MM-DD> -> ZADD scores:daily:2024-01-15 <score> <userId>
scores:weekly:<YYYY-WW> -> ZADD scores:weekly:2024-03 <score> <userId>
scores:monthly:<YYYY-MM> -> ZADD scores:monthly:2024-01 <score> <userId>

# Category-based scores
scores:category:trading -> ZADD scores:category:trading <score> <userId>
scores:category:copying -> ZADD scores:category:copying <score> <userId>
scores:category:liquidity -> ZADD scores:category:liquidity <score> <userId>
```

### 2. User Action Counters (Hashes)

```
# User action counts
user:<userId>:actions -> HSET user:abc123:actions trades 150 copies 25 stakes 10

# Daily action counts
user:<userId>:actions:<YYYY-MM-DD> -> HINCRBY user:abc123:actions:2024-01-15 trades 1
```

### 3. Action History (Lists)

```
# Recent actions for activity feed
user:<userId>:recent -> LPUSH user:abc123:recent <actionJSON>
```

### 4. Achievements (Sets)

```
# User achievements/badges
user:<userId>:achievements -> SADD user:abc123:achievements "first_trade" "whale_trader"
```

### 5. Streaks (Strings/Hashes)

```
# Trading streaks
user:<userId>:streak:trading -> SET user:abc123:streak:trading 7
user:<userId>:streak:last_trade -> SET user:abc123:streak:last_trade "2024-01-15"
```

## Scoring Logic

### Action Point Values

```typescript
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
        profitMultiplier: (profitPercent: number) => {
          if (profitPercent >= 100) return 3.0
          if (profitPercent >= 50) return 2.0
          if (profitPercent >= 10) return 1.5
          return 1.0
        }
      }
    },
    
    // Copy Trading
    COPY_TRADE: {
      base: 5,
      multipliers: {
        success: 2.0,
        speedBonus: (delayMs: number) => {
          if (delayMs < 1000) return 2.0  // Under 1 second
          if (delayMs < 5000) return 1.5  // Under 5 seconds
          return 1.0
        }
      }
    },
    
    COPIED_BY_OTHERS: {
      base: 20,
      multipliers: {
        copierCount: (count: number) => Math.min(count, 10) // Up to 10x
      }
    },
    
    // Staking
    STAKE_SSE: {
      base: 15,
      multipliers: {
        amount: (amount: number) => {
          if (amount >= 100000) return 5.0
          if (amount >= 50000) return 3.0
          if (amount >= 10000) return 2.0
          return 1.0
        },
        duration: (days: number) => {
          if (days >= 365) return 3.0
          if (days >= 180) return 2.0
          if (days >= 30) return 1.5
          return 1.0
        }
      }
    },
    
    // Social Actions
    PROFILE_COMPLETE: { base: 50, oneTime: true },
    PROFILE_VERIFIED: { base: 100, oneTime: true },
    REFERRAL_SIGNUP: { base: 100 },
    REFERRAL_TRADE: { base: 25 },
    
    // Milestones
    FIRST_TRADE: { base: 100, oneTime: true },
    FIRST_PROFITABLE_TRADE: { base: 200, oneTime: true },
    TRADING_STREAK_7: { base: 500, oneTime: true },
    TRADING_STREAK_30: { base: 2000, oneTime: true },
  },
  
  // Decay factors for time-based scoring
  decay: {
    daily: 0.9,    // Previous day scores worth 90%
    weekly: 0.8,   // Previous week scores worth 80%
    monthly: 0.7   // Previous month scores worth 70%
  }
}
```

## Implementation

### 1. Score Manager Service

```typescript
// src/services/score-manager.ts
import redis from '@/utils/redis'
import { SCORING_CONFIG } from './scoring-config'

export class ScoreManager {
  private redis = redis

  async addScore(
    userId: string,
    action: string,
    metadata: Record<string, any> = {}
  ): Promise<number> {
    const config = SCORING_CONFIG.actions[action]
    if (!config) throw new Error(`Unknown action: ${action}`)

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

    // Update scores in parallel
    const pipeline = this.redis.pipeline()
    const now = new Date()
    const dateKey = now.toISOString().split('T')[0]
    const weekKey = `${now.getFullYear()}-${this.getWeekNumber(now)}`
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

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

    // Add to recent actions
    const actionRecord = {
      action,
      score,
      metadata,
      timestamp: now.toISOString()
    }
    pipeline.lpush(`user:${userId}:recent`, JSON.stringify(actionRecord))
    pipeline.ltrim(`user:${userId}:recent`, 0, 99) // Keep last 100 actions

    // Set expiry for time-based keys
    pipeline.expire(`scores:daily:${dateKey}`, 60 * 60 * 24 * 7) // 7 days
    pipeline.expire(`scores:weekly:${weekKey}`, 60 * 60 * 24 * 30) // 30 days
    pipeline.expire(`scores:monthly:${monthKey}`, 60 * 60 * 24 * 365) // 1 year
    pipeline.expire(`user:${userId}:actions:${dateKey}`, 60 * 60 * 24 * 7)

    await pipeline.exec()

    // Check for achievements
    await this.checkAchievements(userId, action, metadata)

    return score
  }

  async getUserScore(userId: string, timeframe: 'lifetime' | 'daily' | 'weekly' | 'monthly' = 'lifetime'): Promise<number> {
    const key = timeframe === 'lifetime' 
      ? 'scores:lifetime'
      : `scores:${timeframe}:${this.getCurrentTimeKey(timeframe)}`
    
    const score = await this.redis.zscore(key, userId)
    return score || 0
  }

  async getLeaderboard(
    timeframe: 'lifetime' | 'daily' | 'weekly' | 'monthly' = 'lifetime',
    limit: number = 100,
    offset: number = 0
  ): Promise<Array<{ userId: string; score: number; rank: number }>> {
    const key = timeframe === 'lifetime'
      ? 'scores:lifetime'
      : `scores:${timeframe}:${this.getCurrentTimeKey(timeframe)}`

    const results = await this.redis.zrevrange(key, offset, offset + limit - 1, 'WITHSCORES')
    
    const leaderboard = []
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        userId: results[i] as string,
        score: parseInt(results[i + 1] as string),
        rank: offset + (i / 2) + 1
      })
    }

    return leaderboard
  }

  async getUserRank(userId: string, timeframe: 'lifetime' | 'daily' | 'weekly' | 'monthly' = 'lifetime'): Promise<number | null> {
    const key = timeframe === 'lifetime'
      ? 'scores:lifetime'
      : `scores:${timeframe}:${this.getCurrentTimeKey(timeframe)}`

    const rank = await this.redis.zrevrank(key, userId)
    return rank !== null ? rank + 1 : null
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  private getCurrentTimeKey(timeframe: 'daily' | 'weekly' | 'monthly'): string {
    const now = new Date()
    switch (timeframe) {
      case 'daily':
        return now.toISOString().split('T')[0]
      case 'weekly':
        return `${now.getFullYear()}-${this.getWeekNumber(now)}`
      case 'monthly':
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }
  }

  private async checkAchievements(userId: string, action: string, metadata: Record<string, any>) {
    // Implementation for checking and awarding achievements
    // This would check various conditions and award badges
  }
}

export const scoreManager = new ScoreManager()
```

### 2. Integration with Trade Creation

```typescript
// Update use-create-trade-content.ts
import { scoreManager } from '@/services/score-manager'

export function useCreateTradeContentNode() {
  const { mainProfile } = useCurrentWallet()

  const createContentNode = async (params: CreateContentNodeParams) => {
    try {
      // ... existing content creation logic ...

      // Award points for the trade
      if (mainProfile?.id) {
        const scoreMetadata = {
          volumeUSD: parseFloat(swapUsdValue || '0'),
          profitPercent: parseFloat(profitPercentage),
          category: 'trading',
          inputMint,
          outputMint,
          isCopyTrade: !!sourceWallet
        }

        // Award points for executing a trade
        await scoreManager.addScore(
          mainProfile.id,
          sourceWallet ? 'COPY_TRADE' : 'TRADE_EXECUTE',
          scoreMetadata
        )

        // If this trade was copied, award points to the source
        if (sourceWallet && sourceProfile?.id) {
          await scoreManager.addScore(
            sourceProfile.id,
            'COPIED_BY_OTHERS',
            {
              copierCount: 1, // In real implementation, fetch actual count
              category: 'influence',
              copiedByUser: mainProfile.id
            }
          )
        }

        // Check for milestones
        const actionCount = await redis.hget(`user:${mainProfile.id}:actions`, 'TRADE_EXECUTE')
        if (actionCount === '1') {
          await scoreManager.addScore(mainProfile.id, 'FIRST_TRADE', {})
        }

        if (profitUsd > 0 && !await redis.sismember(`user:${mainProfile.id}:achievements`, 'first_profitable_trade')) {
          await scoreManager.addScore(mainProfile.id, 'FIRST_PROFITABLE_TRADE', {})
          await redis.sadd(`user:${mainProfile.id}:achievements`, 'first_profitable_trade')
        }
      }

    } catch (err) {
      console.error('Error creating content node:', err)
    }
  }

  return { createContentNode }
}
```

### 3. API Endpoints

```typescript
// src/app/api/scores/[userId]/route.ts
import { scoreManager } from '@/services/score-manager'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params
  const { searchParams } = new URL(request.url)
  const timeframe = searchParams.get('timeframe') || 'lifetime'

  try {
    const [score, rank, recentActions] = await Promise.all([
      scoreManager.getUserScore(userId, timeframe as any),
      scoreManager.getUserRank(userId, timeframe as any),
      redis.lrange(`user:${userId}:recent`, 0, 9)
    ])

    const actions = recentActions.map(a => JSON.parse(a as string))

    return NextResponse.json({
      userId,
      score,
      rank,
      timeframe,
      recentActions: actions
    })
  } catch (error) {
    console.error('Error fetching user score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch score' },
      { status: 500 }
    )
  }
}
```

### 4. Leaderboard Component

```typescript
// src/components/scoring/leaderboard.tsx
import { useQuery } from '@/utils/api'
import { useState } from 'react'

interface LeaderboardEntry {
  userId: string
  username?: string
  score: number
  rank: number
  profileImage?: string
}

export function ScoreLeaderboard() {
  const [timeframe, setTimeframe] = useState<'lifetime' | 'daily' | 'weekly' | 'monthly'>('lifetime')
  
  const { data, loading } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    endpoint: `scores/leaderboard`,
    queryParams: { timeframe, limit: 100 }
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['lifetime', 'monthly', 'weekly', 'daily'] as const).map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded ${
              timeframe === tf ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {data?.leaderboard.map((entry) => (
          <div key={entry.userId} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-500">
              #{entry.rank}
            </div>
            <Avatar imageUrl={entry.profileImage} username={entry.username} />
            <div className="flex-1">
              <div className="font-semibold">{entry.username || entry.userId}</div>
              <div className="text-sm text-gray-500">{entry.score.toLocaleString()} points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Performance Optimizations

### 1. Batch Operations

```typescript
class ScoreBatcher {
  private batch: Map<string, { action: string; metadata: any }[]> = new Map()
  private timer: NodeJS.Timeout | null = null

  async addToBatch(userId: string, action: string, metadata: any) {
    if (!this.batch.has(userId)) {
      this.batch.set(userId, [])
    }
    this.batch.get(userId)!.push({ action, metadata })

    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 100) // Flush every 100ms
    }

    if (this.batch.size > 100) { // Or if batch gets too large
      await this.flush()
    }
  }

  private async flush() {
    const pipeline = redis.pipeline()
    
    for (const [userId, actions] of this.batch.entries()) {
      let totalScore = 0
      for (const { action, metadata } of actions) {
        const score = calculateScore(action, metadata)
        totalScore += score
      }
      
      // Add all score updates to pipeline
      pipeline.zincrby('scores:lifetime', totalScore, userId)
      // ... other updates
    }

    await pipeline.exec()
    this.batch.clear()
    this.timer = null
  }
}
```

### 2. Caching Layer

```typescript
// Cache user scores with short TTL
export const getCachedUserScore = dedupRequest(
  (userId: string, timeframe: string) => `user-score:${userId}:${timeframe}`,
  async (userId: string, timeframe: string) => {
    return scoreManager.getUserScore(userId, timeframe as any)
  },
  30 // 30 second cache
)

// Cache leaderboards
export const getCachedLeaderboard = dedupRequest(
  (timeframe: string, page: number) => `leaderboard:${timeframe}:${page}`,
  async (timeframe: string, page: number) => {
    return scoreManager.getLeaderboard(timeframe as any, 20, page * 20)
  },
  60 // 60 second cache
)
```

### 3. Background Jobs

```typescript
// Periodic aggregation for better performance
export async function aggregateScores() {
  // Run daily to compute weekly/monthly aggregates
  const dailyKeys = await redis.keys('scores:daily:*')
  
  for (const key of dailyKeys) {
    const date = key.split(':')[2]
    // Aggregate into weekly/monthly scores
  }
}

// Clean up old data
export async function cleanupOldScores() {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 30)
  
  // Remove daily scores older than 30 days
  const oldKeys = await redis.keys(`scores:daily:*`)
  // Filter and delete old keys
}
```

## Analytics & Insights

### 1. User Activity Patterns

```typescript
export async function getUserActivityInsights(userId: string) {
  const now = new Date()
  const insights = {
    streaks: {},
    patterns: {},
    achievements: []
  }

  // Trading streak
  let currentStreak = 0
  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    
    const trades = await redis.hget(`user:${userId}:actions:${dateKey}`, 'TRADE_EXECUTE')
    if (trades && parseInt(trades) > 0) {
      currentStreak++
    } else {
      break
    }
  }
  
  insights.streaks.trading = currentStreak

  // Most active hours
  const recentActions = await redis.lrange(`user:${userId}:recent`, 0, 999)
  const hourCounts = new Array(24).fill(0)
  
  for (const actionStr of recentActions) {
    const action = JSON.parse(actionStr as string)
    const hour = new Date(action.timestamp).getHours()
    hourCounts[hour]++
  }
  
  insights.patterns.activeHours = hourCounts
  
  return insights
}
```

## Migration Strategy

1. **Phase 1**: Implement scoring system alongside existing Solid Score
2. **Phase 2**: Start tracking actions and building historical data
3. **Phase 3**: Launch leaderboards and achievements
4. **Phase 4**: Add gamification elements and rewards

## Monitoring

```typescript
// Track scoring system health
export async function getScoreSystemMetrics() {
  const metrics = {
    totalUsers: await redis.zcard('scores:lifetime'),
    dailyActiveScorers: await redis.zcard(`scores:daily:${new Date().toISOString().split('T')[0]}`),
    topScorers: await scoreManager.getLeaderboard('lifetime', 10),
    recentActions: await redis.llen('system:recent_scores')
  }
  
  return metrics
}
```

## Security Considerations

1. **Rate Limiting**: Prevent score manipulation through rate limiting
2. **Validation**: Validate all score inputs and cap maximum scores
3. **Audit Trail**: Keep detailed logs of all score changes
4. **Anti-Gaming**: Detect and prevent gaming behaviors

## Conclusion

This Redis-based scoring system provides:
- Real-time score tracking
- Multiple leaderboard types
- Achievement system
- Performance optimization
- Scalability for millions of users
- Integration with existing systems

The system is designed to be extensible, allowing for new action types and scoring rules to be added easily.