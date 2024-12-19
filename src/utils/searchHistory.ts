export interface SearchHistoryItem {
  walletAddress: string
  timestamp: number
}

const DB_NAME = 'explorer-db'
const STORE_NAME = 'search-history'
const DB_VERSION = 1

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'walletAddress',
        })
        store.createIndex('timestamp', 'timestamp')
      }
    }
  })
}

export async function addSearchToHistory(walletAddress: string): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const item: SearchHistoryItem = {
      walletAddress,
      timestamp: Date.now(),
    }

    const request = store.put(item)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getRecentSearches(
  limit = 5,
): Promise<SearchHistoryItem[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('timestamp')

    const request = index.openCursor(null, 'prev')
    const results: SearchHistoryItem[] = []

    request.onerror = () => reject(request.error)
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor && results.length < limit) {
        results.push(cursor.value)
        cursor.continue()
      } else {
        resolve(results)
      }
    }
  })
}
