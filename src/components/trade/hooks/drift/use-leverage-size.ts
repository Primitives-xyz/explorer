import { useEffect, useState } from 'react'
import { useDriftUsers } from './use-drift-users'
import { useUserStats } from './use-user-stats'

interface UseLeverageSizeProps {
  symbol: string
  leverageValue: number
  marketPrice: number
}

export function useLeverageSize({
  symbol,
  leverageValue,
  marketPrice,
}: UseLeverageSizeProps) {
  const { accountIds } = useDriftUsers()
  const { userStats } = useUserStats(accountIds[0] || 0)
  const [maxLeverageSize, setMaxLeverageSize] = useState<number>(0)
  const [maxSizeForToken, setMaxSizeForToken] = useState<string>('0.00')
  const [selectedLeverageSizeUsd, setSelectedLeverageSizeUsd] =
    useState<number>(0)
  const [selectedLeverageSizeToken, setSelectedLeverageSizeToken] =
    useState<string>('0.00')

  // This effect calculates max sizes based on user stats and current leverage
  useEffect(() => {
    if (!userStats || !marketPrice || marketPrice <= 0) {
      return
    }

    // Calculate maximum leverage size in USD based on available collateral
    const maxUsdSize = userStats.netUsdValue * userStats.maxLeverage
    setMaxLeverageSize(maxUsdSize)

    // Calculate max size for the specific token (e.g., SOL)
    const maxTokenSize = maxUsdSize / marketPrice
    setMaxSizeForToken(maxTokenSize.toFixed(4))

    // Calculate size based on the selected leverage value
    const selectedSizeUsd = userStats.netUsdValue * leverageValue
    setSelectedLeverageSizeUsd(selectedSizeUsd)

    // Convert USD to token amount
    const selectedSizeToken = selectedSizeUsd / marketPrice
    setSelectedLeverageSizeToken(selectedSizeToken.toFixed(4))
  }, [userStats, leverageValue, marketPrice])

  // Calculate position size based on percentage of max leverage (25%, 50%, 75%, 100%)
  const getSizeByLeveragePercent = (percent: number): string => {
    if (!marketPrice || marketPrice <= 0) return '0.00'

    const sizeUsd = userStats.netUsdValue * leverageValue * (percent / 100)
    const sizeToken = sizeUsd / marketPrice
    return sizeToken.toFixed(4)
  }

  return {
    maxLeverageSize,
    maxSizeForToken,
    selectedLeverageSizeUsd,
    selectedLeverageSizeToken,
    getSizeByLeveragePercent,
  }
}
