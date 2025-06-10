import { Position } from '@/components/tapestry/models/jupiter.models'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useState } from 'react'

interface PositionsResponse {
  count: number
  dataList: Position[]
}

export function useJupPerpsPositions() {
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { walletAddress } = useCurrentWallet()

  useEffect(() => {
    const fetchPositions = async () => {
      if (!walletAddress) {
        setPositions([])
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          `/api/jupiter/perps/positions?walletAddress=${walletAddress}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch positions')
        }

        const data: PositionsResponse = await response.json()
        setPositions(data.dataList)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch positions'
        )
        setPositions([])
      } finally {
        setIsLoading(false)
      }
    }

    // Set up interval to run every 5 seconds
    const intervalId = setInterval(fetchPositions, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [walletAddress])

  return {
    positions,
    isLoading,
    error,
  }
}
