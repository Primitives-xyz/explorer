import redis from './redis'

// Very short TTL for deduplication (in seconds)
export const DEDUP_TTL = {
  BALANCE: 1, // 1 second for balance data
  QUOTE: 2, // 2 seconds for Jupiter quotes
  TOKEN_HOLDERS: 5, // 5 seconds for token holders
  CONTENT: 3, // 3 seconds for content fetches
  SOLID_SCORE: 30, // 30 seconds for solid score (changes less frequently)
  PUDGY_INIT: 60, // 1 minute for pudgy initialization
}

// In-memory promise cache for request deduplication
const promiseCache = new Map<string, Promise<any>>()

// Request deduplication with Redis backend
export const dedupRequest = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = DEDUP_TTL.CONTENT
): Promise<T> => {
  const cacheKey = `dedup:${key}`
  
  // Check in-memory promise cache first (for concurrent requests)
  if (promiseCache.has(cacheKey)) {
    return promiseCache.get(cacheKey)!
  }
  
  try {
    // Check Redis cache
    const cached = await redis.get(cacheKey)
    if (cached !== null) {
      return cached as T
    }
    
    // Create promise and store in memory
    const promise = fetcher()
      .then(async (data) => {
        // Cache in Redis with short TTL
        await redis.setex(cacheKey, ttl, JSON.stringify(data))
        promiseCache.delete(cacheKey)
        return data
      })
      .catch((error) => {
        promiseCache.delete(cacheKey)
        throw error
      })
    
    promiseCache.set(cacheKey, promise)
    return promise
  } catch (error) {
    // If Redis fails, just execute the request
    console.warn('Redis dedup error, falling back to direct fetch:', error)
    return fetcher()
  }
}

// Specific deduplication helpers
export const dedupBalance = <T>(
  walletAddress: string,
  mintAddress: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  const key = `balance:${walletAddress}:${mintAddress}`
  return dedupRequest(key, fetcher, DEDUP_TTL.BALANCE)
}

export const dedupContent = <T>(
  contentId: string,
  profileId: string | undefined,
  fetcher: () => Promise<T>
): Promise<T> => {
  const key = `content:${contentId}:${profileId || 'anon'}`
  return dedupRequest(key, fetcher, DEDUP_TTL.CONTENT)
}

export const dedupSolidScore = <T>(
  profileId: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  const key = `solid-score:${profileId}`
  return dedupRequest(key, fetcher, DEDUP_TTL.SOLID_SCORE)
}

export const dedupTokenHolders = <T>(
  mintAddress: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  const key = `holders:${mintAddress}`
  return dedupRequest(key, fetcher, DEDUP_TTL.TOKEN_HOLDERS)
}

export const dedupQuote = <T>(
  inputMint: string,
  outputMint: string,
  amount: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  const key = `quote:${inputMint}:${outputMint}:${amount}`
  return dedupRequest(key, fetcher, DEDUP_TTL.QUOTE)
}