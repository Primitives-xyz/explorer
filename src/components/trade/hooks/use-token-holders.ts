import { useEffect, useState } from 'react'

interface TokenHolder {
  address: string
  amount: string
  uiAmountString: string
}

export function useTokenHolders(id: string) {
  const [holders, setHolders] = useState<TokenHolder[]>([])
  const [holdersLoading, setHoldersLoading] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      try {
        setHoldersLoading(true)
        const response = await fetch(`/api/tokens/largest-holders?mintAddress=${id}`)
        const holders = await response.json().then((data) => data.holders)
        setHolders(holders)
      } catch (error) {
        console.error('Error fetching token holders:', error)
      } finally {
        setHoldersLoading(false)
      }
    })()

  }, [id])

  return {
    holdersLoading,
    holders,
  }
}
