import type { TokenResponse } from '@/types/Token'

const DB_NAME = 'explorer-db'
const STORE_NAME = 'token-info'
const DB_VERSION = 2 // Increment from current version 1

export interface TokenCacheItem {
  mint: string
  data: TokenResponse | null
  timestamp: number
  error?: string
}

export async function initTokenDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create the token info store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'mint',
        })
        store.createIndex('timestamp', 'timestamp')
      }
    }
  })
}

export async function cacheTokenInfo(tokenInfo: TokenCacheItem): Promise<void> {
  const db = await initTokenDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const request = store.put(tokenInfo)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getCachedTokenInfo(
  mint: string,
): Promise<TokenCacheItem | null> {
  const db = await initTokenDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    const request = store.get(mint)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

export async function clearOldTokenCache(maxAge: number): Promise<void> {
  const db = await initTokenDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('timestamp')

    const cutoffTime = Date.now() - maxAge
    const range = IDBKeyRange.upperBound(cutoffTime)

    const request = index.openCursor(range)

    request.onerror = () => reject(request.error)
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        store.delete(cursor.primaryKey)
        cursor.continue()
      } else {
        resolve()
      }
    }
  })
}
