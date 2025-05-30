import { Redis } from '@upstash/redis'

// Initialize Redis client with Upstash connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  TRANSACTION: 60 * 60 * 24 * 7, // 7 days for immutable transaction data
  TRANSACTION_LIST: 60 * 5, // 5 minutes for transaction lists
  PROFILE: 60 * 60, // 1 hour for profile data
}

// Helper functions for transaction caching
export const transactionCache = {
  // Get a single transaction by signature
  async get(signature: string) {
    try {
      const cached = await redis.get(`tx:${signature}`)
      return cached
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  },

  // Set a single transaction
  async set(signature: string, data: any) {
    try {
      await redis.setex(`tx:${signature}`, CACHE_TTL.TRANSACTION, data)
    } catch (error) {
      console.error('Redis set error:', error)
    }
  },

  // Get multiple transactions by signatures
  async getMany(signatures: string[]) {
    try {
      if (signatures.length === 0) return {}

      const keys = signatures.map((sig) => `tx:${sig}`)
      const cached = await redis.mget(...keys)

      const result: Record<string, any> = {}
      signatures.forEach((sig, index) => {
        if (cached[index] !== null) {
          result[sig] = cached[index]
        }
      })

      return result
    } catch (error) {
      console.error('Redis mget error:', error)
      return {}
    }
  },

  // Set multiple transactions
  async setMany(transactions: Record<string, any>) {
    try {
      const pipeline = redis.pipeline()

      Object.entries(transactions).forEach(([signature, data]) => {
        pipeline.setex(`tx:${signature}`, CACHE_TTL.TRANSACTION, data)
      })

      await pipeline.exec()
    } catch (error) {
      console.error('Redis pipeline error:', error)
    }
  },
}

// Helper functions for list caching (for paginated results)
export const listCache = {
  async get(key: string) {
    try {
      const cached = await redis.get(`list:${key}`)
      return cached
    } catch (error) {
      console.error('Redis list get error:', error)
      return null
    }
  },

  async set(key: string, data: any, ttl = CACHE_TTL.TRANSACTION_LIST) {
    try {
      await redis.setex(`list:${key}`, ttl, data)
    } catch (error) {
      console.error('Redis list set error:', error)
    }
  },

  // Invalidate list caches (useful when new transactions are added)
  async invalidate(pattern: string) {
    try {
      // For home-all:*, we need to manually delete known keys
      if (pattern === 'home-all:*') {
        // Clear first few pages that are most likely cached
        const keysToDelete = []
        for (let page = 1; page <= 5; page++) {
          for (const pageSize of [20, 50, 100]) {
            keysToDelete.push(`list:home-all:${page}:${pageSize}`)
          }
        }

        // Delete all keys in parallel
        await Promise.all(
          keysToDelete.map((key) => redis.del(key).catch(() => null))
        )

        console.log(
          `Invalidated ${keysToDelete.length} cache keys for pattern: ${pattern}`
        )
      } else {
        // For specific keys, just delete them
        await redis.del(`list:${pattern}`)
      }
    } catch (error) {
      console.error('Redis invalidate error:', error)
    }
  },
}

// Export the redis client for direct use if needed
export default redis
