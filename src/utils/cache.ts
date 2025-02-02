interface CacheItem<T> {
  value: T
  timestamp: number
}

export class Cache<T> {
  private cache: Map<string, CacheItem<T>> = new Map()
  private ttl: number

  constructor(ttlSeconds: number) {
    this.ttl = ttlSeconds * 1000 // Convert to milliseconds
  }

  set(key: string, value: T) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  clear() {
    this.cache.clear()
  }
}

// Create a singleton instance for follow stats with 30 second TTL
export const followStatsCache = new Cache<{
  followers: number
  following: number
}>(30)
