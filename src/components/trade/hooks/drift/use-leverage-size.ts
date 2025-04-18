import { useEffect, useState } from 'react'
import { UserStats } from '@/components/tapestry/models/drift.model'

interface UseLeverageSizeProps {
  userStats: UserStats
  symbol: string
  leverageValue: number
  marketPrice: number
}

export function useLeverageSize({
  userStats,
  symbol,
  leverageValue,
  marketPrice
}: UseLeverageSizeProps) {
  const [selectedLeverageSizeUsd, setSelectedLeverageSizeUsd] =
    useState<number>(0)
  const [selectedLeverageSizeToken, setSelectedLeverageSizeToken] =
    useState<string>('0.00')

  // This effect calculates max sizes based on user stats and current leverage
  useEffect(() => {
    if (!userStats || !marketPrice || marketPrice <= 0) {
      return
    }

    // Calculate size based on the selected leverage value
    const selectedSizeUsd = userStats.maxTradeSize * leverageValue / userStats.maxLeverage
    setSelectedLeverageSizeUsd(selectedSizeUsd)

    // Convert USD to token amount
    const selectedSizeToken = selectedSizeUsd / marketPrice
    setSelectedLeverageSizeToken(selectedSizeToken.toFixed(2))
  }, [userStats, leverageValue, marketPrice])

  return {
    selectedLeverageSizeUsd,
    selectedLeverageSizeToken,
  }
}