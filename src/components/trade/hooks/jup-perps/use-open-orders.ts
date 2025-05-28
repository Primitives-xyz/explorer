import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useState } from 'react'

interface TPSLRequest {
  // Add TPSL request properties if needed
}

export interface OpenOrder {
  collateralMint: string
  collateralCustody: string
  collateralUsd: string
  collateralUsdAtTriggerPrice: string
  collateralTokenAmount: string
  custody: string
  executed: boolean
  inputMint: string
  liquidationPriceUsd: string
  marketMint: string
  maxSizeUsdDelta: string
  maxSizeUsdDeltaFormatted: string
  minSizeUsdDelta: string
  minSizeUsdDeltaFormatted: string
  openTime: string
  positionPubkey: string
  positionRequestPubkey: string
  side: string
  sizeUsd: string
  triggerPrice: string
  triggerToLiquidationPercent: string | null
}

interface PositionsResponse {
  count: number
  dataList: OpenOrder[]
}

export function useJupOpenOrders() {
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { walletAddress } = useCurrentWallet()

  useEffect(() => {
    const fetchPositions = async () => {
      if (!walletAddress) {
        setOpenOrders([])
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          `/api/jupiter/perps/orders/limit?walletAddress=${walletAddress}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch positions')
        }

        const data: PositionsResponse = await response.json()
        setOpenOrders(data.dataList)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch positions'
        )
        setOpenOrders([])
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
    openOrders,
    isLoading,
    error,
  }
}
