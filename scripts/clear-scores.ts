import redis from '@/utils/redis'

async function clearScores() {
  console.log('🗑️  Starting to clear all score data from Redis...')

  try {
    // Get all keys we need to delete
    const keysToDelete: string[] = []

    // Score leaderboard keys
    const scorePatterns = [
      'scores:lifetime',
      'scores:daily:*',
      'scores:weekly:*',
      'scores:monthly:*',
      'scores:category:*',
    ]

    // User-specific keys
    const userPatterns = [
      'user:*:achievements',
      'user:*:actions',
      'user:*:actions:*',
      'user:*:daily:*',
      'user:*:recent',
      'user:*:streak:*',
      'user:*:stats:*',
      'user:*:daily_volume:*',
    ]

    // System keys
    const systemPatterns = ['system:recent_scores']

    const allPatterns = [...scorePatterns, ...userPatterns, ...systemPatterns]

    console.log('🔍 Scanning for keys to delete...')

    // Scan for all matching keys
    for (const pattern of allPatterns) {
      let cursor = '0'
      do {
        const result = await redis.scan(cursor, {
          match: pattern,
          count: 100,
        })
        cursor = result[0] as string
        const keys = result[1]
        if (keys && keys.length > 0) {
          keysToDelete.push(...keys)
        }
      } while (cursor !== '0')
    }

    console.log(`📊 Found ${keysToDelete.length} keys to delete`)

    if (keysToDelete.length === 0) {
      console.log('✅ No score data found to clear')
      return
    }

    // Delete in batches to avoid overwhelming Redis
    const batchSize = 100
    for (let i = 0; i < keysToDelete.length; i += batchSize) {
      const batch = keysToDelete.slice(i, i + batchSize)
      await redis.del(...batch)
      console.log(
        `🗑️  Deleted ${Math.min(i + batchSize, keysToDelete.length)}/${
          keysToDelete.length
        } keys`
      )
    }

    console.log('✅ Successfully cleared all score data!')

    // Verify by checking some key patterns
    const lifetimeScore = await redis.zcard('scores:lifetime')
    console.log(`\n📊 Verification:`)
    console.log(`   - Lifetime leaderboard entries: ${lifetimeScore}`)
  } catch (error) {
    console.error('❌ Error clearing scores:', error)
    process.exit(1)
  }
}

// Run the script
clearScores()
  .then(() => {
    console.log('\n👋 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
