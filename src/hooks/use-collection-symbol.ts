import { useEffect, useState } from 'react'

interface UseCollectionSymbolResult {
  collectionSymbol: string | null
  isLoading: boolean
  error: Error | null
}

export function useCollectionSymbol(id: string): UseCollectionSymbolResult {
  const [collectionSymbol, setCollectionSymbol] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCollectionSymbol = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/magiceden/collection/${id}`)
        const data = await response.json()
        setCollectionSymbol(data.collectionSymbol)
      } catch (error) {
        console.error('Error fetching collection symbol:', error)
        setError(
          error instanceof Error
            ? error
            : new Error('Failed to fetch collection symbol')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollectionSymbol()
  }, [id])

  return {
    collectionSymbol,
    isLoading,
    error,
  }
}
