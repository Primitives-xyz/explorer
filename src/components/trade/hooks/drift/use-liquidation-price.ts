import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useState } from 'react'
import { useDriftUsers } from './use-drift-users'
import { useInitializeDrift } from './use-initialize-drift'

interface UseLiquidationPriceProps {
  symbol: string
  amount: string
  direction: 'long' | 'short'
}

export function useLiquidationPrice({
  symbol,
  amount,
  direction,
}: UseLiquidationPriceProps) {
  const [liquidationPrice, setLiquidationPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const { accountIds } = useDriftUsers()
  const { walletAddress, isLoggedIn } = useCurrentWallet()

  useEffect(() => {
    const fetchLiquidationPrice = async () => {
      try {
        if (!isLoggedIn || !driftClient) return
        if (!accountIds.length) return

        setLoading(true)

        const baseurl = `api/drift/liqprice/?wallet=${walletAddress}&subAccountId=0&symbol=SOL&direction=${direction}&amount=${Number(
          amount
        )}`
        const res = await fetch(baseurl, {
          method: 'GET',
        })
        const data = await res.json()
        if (!data.error) {
          const liqPrice = data.liqPrice
          setLiquidationPrice(Number(liqPrice))
        }
        setError(null)
      } catch (err) {
        console.error('Error calculating liquidation price:', err)
        setError('Failed to calculate liquidation price')
        setLiquidationPrice(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLiquidationPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, symbol, amount, direction])

  return {
    liquidationPrice,
    loading,
    error,
  }
}
