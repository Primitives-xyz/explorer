import redis from '../src/utils/redis'

// Configuration
const USERNAME_TO_CLEANUP = 'Cooker'

// Helper function to calculate ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

async function cleanupUserScores(username: string) {
  console.log(`🧹 Starting cleanup for user: ${username}`)
  console.log('='.repeat(50))

  const removedKeys: string[] = []
  const errors: string[] = []
  let removedCount = 0

  try {
    // 1. Remove from all base leaderboards
    console.log('\n📊 Removing from leaderboards...')
    const baseLeaderboards = [
      'scores:lifetime',
      'scores:category:trading',
      'scores:category:social',
      'scores:category:influence',
      'scores:category:achievement',
    ]

    for (const leaderboard of baseLeaderboards) {
      try {
        const removed = await redis.zrem(leaderboard, username)
        if (removed > 0) {
          removedCount += removed
          console.log(`  ✅ Removed from ${leaderboard}`)
          removedKeys.push(leaderboard)
        }
      } catch (error) {
        const errMsg = `Failed to remove from ${leaderboard}: ${error}`
        console.error(`  ❌ ${errMsg}`)
        errors.push(errMsg)
      }
    }

    // 2. Remove from time-based leaderboards (last 365 days)
    console.log('\n📅 Removing from time-based leaderboards...')
    const now = new Date()
    const processedKeys = new Set<string>()

    for (let i = 0; i < 365; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Daily
      const dailyKey = `scores:daily:${date.toISOString().split('T')[0]}`

      // Weekly
      const weekNumber = getWeekNumber(date)
      const weeklyKey = `scores:weekly:${date.getFullYear()}-${weekNumber}`

      // Monthly
      const monthlyKey = `scores:monthly:${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`

      for (const key of [dailyKey, weeklyKey, monthlyKey]) {
        if (!processedKeys.has(key)) {
          processedKeys.add(key)
          try {
            const removed = await redis.zrem(key, username)
            if (removed > 0) {
              removedCount += removed
              removedKeys.push(key)
            }
          } catch (error) {
            // Silently skip - key might not exist
          }
        }
      }
    }
    console.log(`  ✅ Checked ${processedKeys.size} time-based leaderboards`)

    // 3. Remove user-specific keys
    console.log('\n🗑️  Removing user-specific data...')
    const userPatterns = [`user:${username}:*`, `trader:${username}:*`]

    for (const pattern of userPatterns) {
      try {
        const keys = await redis.keys(pattern)
        console.log(`  Found ${keys.length} keys matching pattern: ${pattern}`)

        for (const key of keys) {
          try {
            await redis.del(key)
            removedKeys.push(key)
            removedCount++
          } catch (error) {
            const errMsg = `Failed to delete ${key}: ${error}`
            console.error(`  ❌ ${errMsg}`)
            errors.push(errMsg)
          }
        }
      } catch (error) {
        console.error(`  ❌ Error scanning for pattern ${pattern}: ${error}`)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📋 CLEANUP SUMMARY:')
    console.log(`  ✅ Total items removed: ${removedCount}`)
    console.log(`  ✅ Keys affected: ${removedKeys.length}`)
    if (errors.length > 0) {
      console.log(`  ⚠️  Errors encountered: ${errors.length}`)
      errors.forEach((err) => console.log(`    - ${err}`))
    }
    console.log('='.repeat(50))

    // Show sample of removed keys
    if (removedKeys.length > 0) {
      console.log('\n📝 Sample of removed keys:')
      removedKeys.slice(0, 10).forEach((key) => console.log(`  - ${key}`))
      if (removedKeys.length > 10) {
        console.log(`  ... and ${removedKeys.length - 10} more`)
      }
    }

    return {
      success: true,
      removedCount,
      removedKeys,
      errors,
    }
  } catch (error) {
    console.error('\n❌ Fatal error during cleanup:', error)
    return {
      success: false,
      removedCount,
      removedKeys,
      errors: [
        ...errors,
        error instanceof Error ? error.message : 'Unknown error',
      ],
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Score Cleanup Script')
  console.log(`📍 Target user: ${USERNAME_TO_CLEANUP}`)
  console.log(`⏰ Started at: ${new Date().toISOString()}`)

  try {
    // Test Redis connection
    await redis.ping()
    console.log('✅ Redis connection established')

    // Confirm before proceeding
    console.log(
      '\n⚠️  WARNING: This will permanently delete all score data for this user!'
    )
    console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n')

    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Run cleanup
    const result = await cleanupUserScores(USERNAME_TO_CLEANUP)

    if (result.success) {
      console.log('\n✅ Cleanup completed successfully!')
    } else {
      console.log('\n⚠️  Cleanup completed with errors')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  } finally {
    console.log('\n👋 Script finished')
  }
}

// Run the script
main().catch(console.error)
